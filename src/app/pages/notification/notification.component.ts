import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  items: any = []
  constructor(
    private http: HttpService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.getAll()
  }

  getAll() {
    let params = {
      pageIndex: 1,
      pageSize: 10
    }
    let body = {
      UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
    }
    this.http.post('Notification/GetNotifications', body, true, params).subscribe((res: any) => {
      this.items = res?.data?.list;
    })

  }

  makeNotificationRead(key: string) {
    let body = {
      loginId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      messageKeys: [key],
      isRead: true
    }
    var res = this.http.post('Notification/MakeNotificationReadByLogin', body).toPromise();
  }
}
