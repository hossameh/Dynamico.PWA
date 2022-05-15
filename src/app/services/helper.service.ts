import { Injectable } from '@angular/core';
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

  constructor(
    private http: HttpService,
  ) { }

  getNotificationCount() {
    let body = {
      UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      isRead: false
    }
    this.http.post('Notification/GetNotificationCount', body).subscribe((res: any) => {
      this.getingNotificationCount.next(+res.data);
    })
  }
  getWorkflowCount() {
    this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(res => {
      this.getingCount.next(res);
    })
  }

}
