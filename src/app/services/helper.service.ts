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
  userId: any;

  constructor(
    private http: HttpService,
    private storage: Storage
  ) {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
  }

  async getNotificationCount() {
    let notificationCounts = await this.storage.get("NotificationCounts") || [];
    let userNotificationCount : any = Object.values(notificationCounts).filter((el: any) => el.userId == this.userId);
    notificationCounts = Object.values(notificationCounts).filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body = {
        UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
        isRead: false
      }
      try {
        this.http.post('Notification/GetNotificationCount', body).subscribe(async (res: any) => {
          this.getingNotificationCount.next(+res.data);
          let obj = {
            userId: this.userId,
            count: +res.data
          };
          notificationCounts.push(obj);
          await this.storage.set("NotificationCounts", notificationCounts);
        })
      }
      catch (ex) { }
    }
    else
      this.getingNotificationCount.next(userNotificationCount ? userNotificationCount.count : 0);
  }
  async getWorkflowCount() {
    let pendingWorkflowCounts = await this.storage.get("PendingWorkflowCounts") || [];
    let userPendingWorkflowCounts :any = Object.values(pendingWorkflowCounts).filter((el: any) => el.userId == this.userId);
    pendingWorkflowCounts = Object.values(pendingWorkflowCounts).filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      try {
        this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(async res => {
          this.getingCount.next(res);
          let obj = {
            userId: this.userId,
            count: res
          };
          pendingWorkflowCounts.push(obj);
          await this.storage.set("PendingWorkflowCounts", pendingWorkflowCounts);
        })
      }
      catch (ex) { }
    }
    else
      this.getingCount.next(userPendingWorkflowCounts ? userPendingWorkflowCounts.count : 0);
  }

}
