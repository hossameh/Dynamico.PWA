import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationPage, NotificationPageProps } from '../notification.page';
import { HttpService } from 'src/app/services/http/http.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ScreenEnum } from 'src/app/core/enums/screen.enum';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss']
})
export class NotificationDetailsComponent implements OnInit {

  id!: number;
  title: any;
  body: any;
  showAll: any;
  pageProps!: NotificationPageProps;
  screenEnum = ScreenEnum;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private notificationPage: NotificationPage,
    private http: HttpService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.pageProps = this.notificationPage.pageProps;
    // this.id = this.route.snapshot.params.id;
    let params = this.route.snapshot.queryParams;
    // this.title = params?.title;
    // this.body = params?.body;
    this.showAll = params?.showAll;
    if (this.pageProps.selectedObj)
      this.GetNoticationDetails();
  }

  back(): void {
    this.showAll ?
      this.router.navigateByUrl("/page/notification?showAll=" + this.showAll) :
      this.location.back();
  };
  GetNoticationDetails() {
    this.pageProps.objDetails = null;
    let loginId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    let params = {
      UserId: +loginId,
      ObjectId: +this.pageProps?.selectedObj?.objectId,
      Screen: this.pageProps?.selectedObj?.screen
    }
    try {
      this.http.get2(`Notification/GetNotificationDetailsByScreen`, params).subscribe((val) => {
        if (val)
          this.pageProps.objDetails = val;
        // else
        //   this.alert.error("Failed To Load Details");
      });
    }
    catch (err) {
      this.alert.error("Failed To Load Details");
      console.log(err)
    }
  }

}
