import { HttpService } from './../../services/http/http.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HelperService } from 'src/app/services/helper.service';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.loaded && this.pager.page <= (this.pager.pages - 1) && this.isOnline) {
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
  showAllItems: boolean = false;
  constructor(
    private http: HttpService,
    private alert: AlertService,
    private helper: HelperService,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.resetPager();
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
    this.getAll()
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
  getAll() {
    this.loaded = false;
    this.isLoading = true;
    let params = {
      pageIndex: this.pager.page,
      pageSize: this.pager.pageSize
    }
    let body = {
      UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      IsRead: this.showAllItems == false ? false : null
    }
    this.http.post('Notification/GetNotifications', body, true, params).subscribe((res: any) => {
      res?.data?.list.map((el: any) => {
        this.items.push(el);
      });
      // this.items = res?.data?.list;
      this.pager.total = res?.data?.total;
      this.pager.pages = res?.data?.pages;
      this.loaded = true;
      this.isLoading = false;
    })

  }
  clickMenue(event: any) {
    event.stopPropagation();
  }

  makeNotificationRead(key: string) {
    let body = {
      loginId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      messageKeys: [key],
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
  markAllAsRead() {
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
