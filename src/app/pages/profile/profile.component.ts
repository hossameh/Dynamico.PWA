import { TranslateService } from '@ngx-translate/core';
import { environment } from './../../../environments/environment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { NgbDateStruct, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
const now: any = new Date();
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  version = environment.version
  userData: any;
  @ViewChild('d2') dp!: NgbInputDatepicker;
  selectDate  : NgbDateStruct = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  constructor(public translate: TranslateService,
    private http: HttpService,
    private alert: AlertService,
    private router: Router) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
  }

  langChanged(lang: any) {
    let params = {
      lang: lang
    }
    try {
      this.http.post('Users/ChangeDefaultLanguage', null, false, params).subscribe((res: any) => {
        if (res?.isPassed)
          this.setLang(lang);
        else
          this.alert.error("Failed To Change Language !")
      });
    }
    catch (err) {
      console.log(err)
    }
  }
  setLang(lang: any) {
    // const elEn = document.querySelector('#bootstrap-en');
    // const elAr = document.querySelector('#bootstrap-ar');
    this.translate.use(lang)
    localStorage.setItem('lang', lang)
    if (lang === 'ar') {
      // add bootstrap ar
      // elEn && elEn.remove();

      this.generateLinkElement({
        id: 'bootstrap-ar',
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


  async logout() {
    await this.logoutFromOtherDevices(this.userData?.userEmail, this.userData?.userEmail).toPromise();
    const currentLang =  localStorage.getItem("lang");
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("lang", currentLang ?? 'en');
    this.router.navigate(['/login']);
  }
  logoutFromOtherDevices(userName: any, email: any) {
    let url = `Auth/logout?UserName=${userName}&Email=${email}`;
    return this.http.post<any>(`${url}`, null);
  }

  toggle() {
    this.dp.toggle();
  }
  onDateChanged() {
    console.log(this.selectDate)
  }
}
