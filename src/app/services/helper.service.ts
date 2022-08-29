import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  currentLang: BehaviorSubject<string> = new BehaviorSubject('ar');
  checklistData: BehaviorSubject<any> = new BehaviorSubject(null);
  getingCount: BehaviorSubject<any> = new BehaviorSubject(null);
  getingNotificationCount: BehaviorSubject<any> = new BehaviorSubject(null);

  isOnline = true;
  constructor(
    private http: HttpService,
    private storage: Storage
  ) { }

  async getNotificationCount() {
    let notificationCount = await this.storage.get("NotificationCount") || 0;
    if (this.isOnline) {
      let body = {
        UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
        isRead: false
      }
      try {
        this.http.post('Notification/GetNotificationCount', body).subscribe(async (res: any) => {
          this.getingNotificationCount.next(+res.data);
          notificationCount = +res.data;
          await this.storage.set("NotificationCount", notificationCount);
        })
      }
      catch (ex) { }
    }
    else
      this.getingNotificationCount.next(notificationCount);
  }
  async getWorkflowCount() {
    let pendingWorkflowCount = await this.storage.get("PendingWorkflowCount") || 0;
    if (this.isOnline) {
      try {
        this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(async res => {
          this.getingCount.next(res);
          pendingWorkflowCount = res;
          await this.storage.set("PendingWorkflowCount", pendingWorkflowCount);
        })
      }
      catch (ex) { }
    }
    else
      this.getingCount.next(pendingWorkflowCount);
  }

}
