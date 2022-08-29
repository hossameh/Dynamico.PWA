import { HttpService } from './../../services/http/http.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HelperService } from 'src/app/services/helper.service';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationPage, NotificationPageProps } from './notification.page';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.isOnline && this.loaded && this.pager.page <= (this.pager.pages - 1) && this.isOnline) {
      // Load Your Data Here
      this.pager.page += 1;
      this.getAll();
    }
  }
  statusSubscription!: Subscription;
  pager!: IPageInfo;
  loaded = true;
  isOnline = true;
  isLoading = false;

  items: any = [];
  // showAllItems!: boolean;
  pageProps!: NotificationPageProps;
  constructor(
    private http: HttpService,
    private alert: AlertService,
    private helper: HelperService,
    private offline: OfflineService,
    private route: ActivatedRoute,
    private notificationPage: NotificationPage,
    private storage: Storage,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pageProps = this.notificationPage.pageProps;
    this.resetPager();
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
    // let params = this.route.snapshot.queryParams;
    // let show = params?.showAll;
    // (show && (show == "true" || show == true)) ? this.showAllItems = true : this.showAllItems = false;
    this.getAll()
  }
  clickNotification(item: any) {
    this.notificationPage.pageProps.selectedObj = item;
    if (!this.isOnline && item?.isRead == false) {
      this.alert.info("Not Internet Connetion");
      return;
    }
    else
      this.router.navigateByUrl("/page/notification-details");
  }
  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }
  async getAll() {
    let cahsedNotification = await this.storage.get("Notification") || [];
    if (this.isOnline) {
      this.loaded = false;
      this.isLoading = true;
      let params = {
        pageIndex: this.pager.page,
        pageSize: this.pager.pageSize
      }
      let body = {
        UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
        IsRead: this.pageProps.showAll == false ? false : null
        // IsRead: this.showAllItems == false ? false : null
      }
      this.http.post('Notification/GetNotifications', body, true, params).subscribe(async (res: any) => {
        res?.data?.list.map((el: any) => {
          this.items.push(el);
        });
        // this.items = res?.data?.list;
        this.pager.total = res?.data?.total;
        this.pager.pages = res?.data?.pages;
        this.loaded = true;
        this.isLoading = false;
        cahsedNotification = this.items;
        await this.storage.set("Notification", cahsedNotification);
      })
    }
    else
      this.items = this.pageProps.showAll == true ? cahsedNotification :
        cahsedNotification.filter((el: any) => el.isRead == false);
  }
  clickMenue(event: any) {
    event.stopPropagation();
  }

  makeNotificationRead(item: any) {
    if (this.isOnline && item?.isRead == false) {
      let body = {
        loginId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
        messageKeys: [item?.key],
        isRead: true
      }
      try {
        this.http.post('Notification/MakeNotificationReadByLogin', body, false).subscribe((res) => {
          if (res)
            this.helper.getNotificationCount();
        });
      }
      catch (err) {
        console.log(err)
      }
    }
  }
  markAllAsRead() {
    if (this.isOnline) {
      let loginId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
      try {
        this.http.get(`Notification/MarkeAllNotificationAsRead?loginId=${loginId}`).toPromise()
          .then(() => {
            this.resetAll();
          });
      }
      catch (err) {
        console.log(err)
      }
    }
    else
      this.alert.info("Not Internet Connetion");
  }
  resetAll() {
    this.items = [];
    this.resetPager();
    this.getAll();
  }

  bottomReached(): boolean {
    return ((document.documentElement.offsetHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight);
    // return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 0.5);
  }
  scrollToTop() {
    window.scroll(0, 0);
  }
}
