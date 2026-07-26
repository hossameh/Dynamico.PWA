import { HttpService } from './../http/http.service';
import { map } from 'rxjs/operators';
import { HelperService } from './../helper.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConnectionService } from 'ng-connection-service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  currentMessage = new BehaviorSubject(null);
  currentStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  token: any;
  status = "Online";
  isConnected;
  userId: any;

  private backoffSteps = [5_000, 10_000, 20_000, 40_000, 60_000, 60_000];
  private backoffIndex = 0;
  private retryTimer: any = null;
  private retryInFlight = false;

  constructor(
    private connectionService: ConnectionService,
    private toastr: ToastrService,
    private help: HelperService,
    private storage: Storage,
    private http: HttpService) {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    let status = navigator.onLine;
    this.isConnected = status;
    if (this.isConnected) {
      this.currentStatus.next(this.isConnected);
      this.status = "Online";
      this.help.isOnline = true;
      this.resetBackoff();
      this.SendToApi();
      this.deletedRecords();
    }
    else {
      this.help.isOnline = false;
      this.currentStatus.next(this.isConnected);
      this.toastr.error('', 'You Are Currently Offline');
      this.status = "Offline";
    }


    this.connectionService.monitor().subscribe(isConnected => {
      this.currentStatus.next(isConnected);
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "Online";
        this.help.isOnline = true;
        this.toastr.success('', "Your Internet Connection Was Restored");
        this.resetBackoff();
        this.SendToApi();
        this.deletedRecords();
      }
      else {
        this.help.isOnline = false;
        this.toastr.error('', 'You Are Currently Offline');
        this.status = "Offline";

      }
    });
  }

  /**
   * Returns true only for transient network failures (no/lazy response, timeout).
   * Authoritative server rejections (4xx/5xx with a body) are NOT network
   * failures and must NOT be re-queued for retry.
   */
  isNetworkFailure(err: any): boolean {
    if (navigator.onLine === false) return true;
    if (err && err.status !== undefined) {
      return err.status === 0 || err.status === 408 || err.status === 504;
    }
    return true;
  }

  /**
   * Enqueue a failed live `SaveFormRecord` payload into the same queue that
   * offline sends use. De-dups by `offlineRef` when present.
   */
  async enqueueFailedSave(payload: any): Promise<void> {
    if (!payload) return;
    if (payload.userId == null) payload.userId = this.userId;
    if (!payload.offlineRef) payload.offlineRef = 'retry-' + Date.now();
    const q = (await this.storage.get('RecordsWillBeUpserted')) || [];
    const idx = q.findIndex((el: any) =>
      el.userId == this.userId && el.offlineRef == payload.offlineRef);
    if (idx >= 0) q[idx] = payload; else q.push(payload);
    await this.storage.set('RecordsWillBeUpserted', q);
    this.scheduleRetryIfPending();
  }

  /**
   * Enqueue a failed live `DeleteFormRecord` by Record_Id. De-dups so the
   * same delete isn't queued twice.
   */
  async enqueueFailedDelete(recordId: number | string): Promise<void> {
    if (recordId == null) return;
    const q = (await this.storage.get('RecordsWillBeDeleted')) || [];
    const exists = q.some((el: any) => el.userId == this.userId && el.Record_Id == recordId);
    if (!exists) q.push({ userId: this.userId, Record_Id: recordId });
    await this.storage.set('RecordsWillBeDeleted', q);
    this.scheduleRetryIfPending();
  }

  async SendToApi(): Promise<boolean> {
    const all = (await this.storage.get('RecordsWillBeUpserted')) || [];
    const mine = all.filter((el: any) => el.userId == this.userId);
    if (mine.length === 0) {
      this.stopRetry();
      return true;
    }

    let anyFailed = false;
    for (const el of mine) {
      try {
        const res: any = await this.http.post('ChecklistRecords/SaveFormRecord', el).toPromise();
        if (res && res.isPassed) {
          const remaining = all.filter((obj: any) => obj !== el);
          await this.storage.set('RecordsWillBeUpserted', remaining);
        } else {
          anyFailed = true;
        }
      } catch (e) {
        anyFailed = true;
      }
    }
    if (anyFailed) this.scheduleRetryIfPending();
    else this.stopRetry();
    return !anyFailed;
  }

  async deletedRecords(): Promise<boolean> {
    const all = (await this.storage.get('RecordsWillBeDeleted')) || [];
    const mine = all.filter((el: any) => el.userId == this.userId);
    if (mine.length === 0) {
      this.stopRetry();
      return true;
    }

    let anyFailed = false;
    for (const el of mine) {
      try {
        const res: any = await this.http.post(
          'ChecklistRecords/DeleteFormRecord', null, true, { Record_Id: el.Record_Id }).toPromise();
        if (res && res.isPassed) {
          const remaining = all.filter((obj: any) =>
            !(obj.userId == this.userId && obj.Record_Id == el.Record_Id));
          await this.storage.set('RecordsWillBeDeleted', remaining);
        } else {
          anyFailed = true;
        }
      } catch (e) {
        anyFailed = true;
      }
    }
    if (anyFailed) this.scheduleRetryIfPending();
    else this.stopRetry();
    return !anyFailed;
  }

  /**
   * Retry the queues with exponential backoff while still "online but flaky".
   * Capped at backoffSteps[last] (60s). Resets to 0 once everything flushes.
   */
  private scheduleRetryIfPending() {
    if (this.retryTimer || this.retryInFlight) return;
    const delay = this.backoffSteps[Math.min(this.backoffIndex, this.backoffSteps.length - 1)];
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.retryInFlight = true;
      Promise.all([this.SendToApi(), this.deletedRecords()])
        .then(async ([saveOk, delOk]) => {
          this.retryInFlight = false;
          if (saveOk && delOk) {
            this.resetBackoff();
          } else {
            this.backoffIndex = Math.min(this.backoffIndex + 1, this.backoffSteps.length - 1);
            // re-arm next retry (inner scheduleRetryIfPending calls were blocked
            // while retryInFlight was true)
            this.scheduleRetryIfPending();
          }
        })
        .catch(() => {
          this.retryInFlight = false;
          this.backoffIndex = Math.min(this.backoffIndex + 1, this.backoffSteps.length - 1);
          this.scheduleRetryIfPending();
        });
    }, delay);
  }

  private stopRetry() {
    this.resetBackoff();
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
  }

  private resetBackoff() {
    this.backoffIndex = 0;
  }

}