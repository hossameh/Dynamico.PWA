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

  constructor(private helper: HelperService,
    private swUpdates: SwUpdate,
    private http: HttpService,
    private translate:TranslateService,
    private storage: Storage, private router: Router, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.update = false;
    this.createDb();
    this.reloadCache();

    this.listenToFCM();

    // this.getWorkflowCount();
    // this.helper.getNotificationCount();
    this.loadingService.isLoading.subscribe(isLoading => {
      setTimeout(() => {
        this.show = isLoading;
      });
    });

    this.helper.getingNotificationCount.subscribe((count) => {
      this.notifcationCount = count
    })
    window.scrollTo(0, 0);
    this.currentLang = localStorage.getItem('lang');
    if (!this.currentLang) {
      localStorage.setItem('lang', 'en');
      this.currentLang = 'en';
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
          || this.router.url.includes('login') || this.router.url.includes('forgot') || this.router.url.includes('resetpassword');
      }
      window.scrollTo(0, 0);
    });
  }
  async createDb() {
    await this.storage.create();
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
    // const elEn = document.querySelector('#bootstrap-en');
    // const elAr = document.querySelector('#bootstrap-ar');
    if (lang === 'ar') {
      // add bootstrap ar
      // elEn && elEn.remove();

      this.generateLinkElement({
        id: 'bootstrap-en',
        href: 'assets/vendor/bootstrap/bootstrap.rtl.min.css',
        dir: 'rtl',
        lang: 'ar',
      });

    } else {
      // en
      // elAr && elAr.remove();
      this.generateLinkElement({
        id: 'bootstrap-en',
        href: 'assets/vendor/bootstrap/bootstrap.min.css',
        dir: 'ltr',
        lang: 'en',
      });
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
      console.log('Message received. ', payload);

    });
  }
}
