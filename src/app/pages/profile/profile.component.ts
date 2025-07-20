import { TranslateService } from '@ngx-translate/core';
import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { API } from 'src/app/core/interface/api.interface';
import { HelperService } from 'src/app/services/helper.service';
import { LangEnum } from 'src/app/core/enums/common.enum';
import { LocationLoggerService } from '../../services/location-logger/location-logger.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  version = environment.version
  userData: any;

  constructor(public readonly translate: TranslateService, private logger: LocationLoggerService,
    private readonly http: HttpService,
    private readonly alert: AlertService,
    private readonly router: Router,
    private readonly helper: HelperService) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
  }

  langChanged(lang: any) {
    let params = {
      lang: lang
    }
    try {
      this.http.post('Users/ChangeDefaultLanguage', null, false, params).subscribe((res: any) => {
        if (res?.isPassed && lang)
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

    this.translate.use(lang)
    localStorage.setItem('lang', lang)
    if (lang === 'ar') {

      this.generateLinkElement({
        id: 'bootstrap-ar',
        href: 'assets/vendor/bootstrap/bootstrap.rtl.min.css',
        dir: 'rtl',
        lang: 'ar',
      });

    } else {

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

  }

  clearData() {
    localStorage.clear();
    sessionStorage.clear();
    const currentLang = localStorage.getItem("lang");
    localStorage.setItem("lang", currentLang ?? LangEnum.English);
  }
  logout() {
    this.logoutFromOtherDevices(this.userData?.username).subscribe((res) => {
      if (res.isPassed) {
        this.clearData();
        if (res.data?.url) {
          this.router.navigate(['/login']).then(() => {
            setTimeout(this.helper.openLogoutWindow.bind(this, res.data?.url));
          });
        }
        else {
          this.router.navigate(['/login']);
        }
        this.logger.stopLogger();

      }
      else {
        this.alert.error(res?.message);
      }

    },
      (error) => {
        this.alert.error(error?.message);
      });

  }
  logoutFromOtherDevices(userName: any) {
    let url = `Auth/logout?UserName=${userName}`;
    return this.http.post<API>(`${url}`, null);
  }


}
