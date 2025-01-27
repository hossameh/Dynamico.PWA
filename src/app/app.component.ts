import { TranslateService } from '@ngx-translate/core';
import { HttpService } from './services/http/http.service';
import { LoadingService } from './services/loading/loading.service';
import { HelperService } from './services/helper.service';
import { Component } from '@angular/core';
import { routingAnimation } from './router.animations';
import { NavigationEnd, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { SwUpdate } from '@angular/service-worker';
import { getMessaging, onMessage } from 'firebase/messaging';
import { ToastrService } from 'ngx-toastr';
import { NotificationPage } from './pages/notification/notification.page';
import { environment } from 'src/environments/environment';
import { Role } from './core/enums/role.enum';
import { LangEnum } from './core/enums/common.enum';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routingAnimation],

})
export class AppComponent {
  currentLang!: any;
  show = false;
  update = false;
  hideNotifcation = false;
  notifcationCount = 5;
  message: any = null;
  role = Role;
  userRole!: string;

  constructor(private readonly helper: HelperService,
    private readonly swUpdates: SwUpdate,
    private readonly http: HttpService,
    private readonly translate: TranslateService,
    private readonly toastr: ToastrService,
    private readonly storage: Storage,
    private readonly router: Router,
    private readonly notificationPage: NotificationPage,
    private readonly loadingService: LoadingService) { }

  ngOnInit(): void {
    this.update = false;
    this.userRole = JSON.parse(localStorage.getItem('userData') || '{}').userType;
    this.createDb();
    this.reloadCache();

    this.listenToFCM();

 
    this.loadingService.isLoading.subscribe(isLoading => {
      setTimeout(() => {
        this.show = isLoading;
      });
    });

    this.helper.getingNotificationCount.subscribe((count) => {
      this.notifcationCount = count
    })
    window.scrollTo(0, 0);
    this.currentLang = localStorage.getItem('lang') ?? '';
    if (!this.currentLang) {
      localStorage.setItem('lang', LangEnum.English);
      this.currentLang = LangEnum.English;
    } else {
      localStorage.setItem('lang', this.currentLang);
    }
    this.translate.use(this.currentLang)
    this.langChanged(this.currentLang);
    this.helper.currentLang.next(this.currentLang);
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      } else {
        this.hideNotifcation = this.router.url.includes('notification') || this.router.url.includes('visits') || this.router.url.includes('search')
          || this.router.url.includes('login')
          || this.router.url.includes('GuestLogin')
          || this.userRole == this.role.Anonymous
          || this.router.url.includes('forgot') || this.router.url.includes('resetpassword');
      }
      window.scrollTo(0, 0);
    });
  }
  async createDb() {
    await this.storage.create().then(async (res) => {
      let ver = await this.storage.get("version") || null;
      if (ver) {
        if (ver !== environment.version) {
          await this.storage.clear();
          await this.storage.set("version", environment.version);
        }
      }
      else {
        await this.storage.clear();
        await this.storage.set("version", environment.version);
      }
    });
  }

  reloadCache() {
    if (this.swUpdates.isEnabled) {
      this.swUpdates.available.subscribe(() => {
        this.update = true;
      });
    }
  }
  getWorkflowCount() {
    this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(res => {
      this.helper.getingCount.next(res);
    })
  }
  updateAccept() {
    this.update = false;
    window.location.reload();
  }

  langChanged(lang: any) {
    const elEn = document.querySelector('#bootstrap-en');
    const elAr = document.querySelector('#bootstrap-ar');
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    if (lang === 'ar') {
      // add bootstrap ar
      elEn && elEn.remove();
      if (!elAr) {
        this.generateLinkElement({
          id: 'bootstrap-ar',
          href: 'assets/vendor/bootstrap/bootstrap.rtl.min.css',
          dir: 'rtl',
          lang: 'ar',
        });
      }
    } else {
      // en
      elAr && elAr.remove() ;
      if (!elEn) {
        this.generateLinkElement({
          id: 'bootstrap-en',
          href: 'assets/vendor/bootstrap/bootstrap.min.css',
          dir: 'ltr',
          lang: 'en',
        });
      }
    }
  }
  generateLinkElement(props: any) {
    const el = document.createElement('link');
    const htmlEl = document.getElementsByTagName('html')[0];
    el.rel = 'stylesheet';
    el.href = props.href;
    el.id = props.id;
    document.head.prepend(el);
    htmlEl.setAttribute('dir', props.dir);
    htmlEl.setAttribute('lang', props.lang);
    // this.loaderService.isLoading.next(false);
  }

  listenToFCM() {
    const messaging = getMessaging();
    onMessage(messaging, (payload: any) => {
      // occures if the user is online on this browser tab
      // console.log('Message received. ', payload);
      this.message = payload;
      this.currentLang = localStorage.getItem('lang');
      let title = this.currentLang == 'en' ? this.message?.notification?.title : this.message?.data?.arTitle;
      let body = this.currentLang == 'en' ? this.message?.notification?.body : this.message?.data?.arBody;
      this.showToaster(title, body);
    });
  }



  showToaster(title: any, body: any) {
    this.toastr.info(title, body, {
      // timeOut: 15000,
      // extendedTimeOut: 10000,
      newestOnTop: false,
      closeButton: false,
      disableTimeOut: true,
      positionClass: "notif-mob"
    })
      .onTap
      .subscribe(() => this.toasterClickedHandler());
  }
  toasterClickedHandler() {
    this.makeNotificationRead();
    this.notificationPage.pageProps.selectedObj = this.message?.notification;
    this.router.navigateByUrl("/page/notification-details");
    // this.router.navigateByUrl("/page/notification-details/1?title=" + this.message?.notification?.body + "&body=" + this.message?.notification?.title)
  }
  makeNotificationRead() {
    let body = {
      loginId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      messageKeys: [this.message?.data?.key],
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
