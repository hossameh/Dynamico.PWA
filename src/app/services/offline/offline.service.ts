import { HttpService } from './../http/http.service';
import { map } from 'rxjs/operators';
import { HelperService } from './../helper.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
      // this.toastr.success('', "Your Internet Connection Was Restored");
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

  async SendToApi() {
    let cacheRecords = await this.storage.get('RecordsWillBeUpserted') || [];
    let userCacheRecords = cacheRecords.filter((el: any) => el.userId == this.userId);
    if (userCacheRecords.length > 0) {
      let sentRecords: any[] = [];
      userCacheRecords.map((el: any, index: number) => {
        this.http.post('ChecklistRecords/SaveFormRecord', el).subscribe(async (res: any) => {
          if (res.isPassed) {            
            cacheRecords = cacheRecords.filter((obj: any) => !(obj == el));
          }
          await this.storage.set('RecordsWillBeUpserted', cacheRecords);
        });
      });
    }
  }
  async deletedRecords() {
    let cacheRecords = await this.storage.get('RecordsWillBeDeleted') || [];
    let userCacheRecords = cacheRecords.filter((el: any) => el.userId == this.userId);

    if (userCacheRecords.length > 0) {
      userCacheRecords.map((el: any, index: number) => {
        this.http.post('ChecklistRecords/DeleteFormRecord', null, true, { Record_Id: el.Record_Id }).subscribe(async (res: any) => {
          if (res.isPassed) {
            cacheRecords = cacheRecords.filter((obj: any) => !(obj.userId == this.userId && obj.Record_Id == el.Record_Id));
            await this.storage.set("RecordsWillBeDeleted", cacheRecords);
          }
        });
      });
    }
  }

}
