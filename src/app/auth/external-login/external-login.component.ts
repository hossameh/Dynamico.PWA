import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API } from 'src/app/core/interface/api.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LangEnum } from 'src/app/core/enums/common.enum';

@Component({
  selector: 'app-external-login',
  templateUrl: './external-login.component.html',
  styleUrls: ['./external-login.component.scss']
})
export class ExternalLoginComponent implements OnInit {
  authForm!: FormGroup;
  code!: string;
  companyName: string = environment.companyName;
  companyLogo: string = environment.companyLogo;

  constructor(private router: Router, private FB: FormBuilder,
    private alert: AlertService,
    private translate: TranslateService,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private http: HttpService) { }

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParams['code'] || '/';

    this.BuildRequestForm();
    const lang = localStorage.getItem('lang') ?? '';
    localStorage.clear();

    if (lang)
      this.langChanged(lang);
    else
      this.langChanged(LangEnum.English);
    debugger
    if (this.code) {
      this.redirectOnInit();
    }
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
      elAr && elAr.remove();
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


  BuildRequestForm() {
    this.authForm = this.FB.group({
      email: [null, [Validators.required, Validators.email]],
    });
  }
  get f() {
    return this.authForm.controls;
  }
  login() {
    let body = this.authForm.value;
    body.code = this.code;

    this.http.post('Guest/LoginGuest', body, true).subscribe(async (res: any) => {
      if (res.isPassed) {

        await localStorage.setItem('userData', JSON.stringify(res?.data?.userToken));
        await localStorage.setItem('token', JSON.stringify(res.data?.userToken?.resetToken));


        this.router.navigateByUrl("/page/checklist/" + res?.data?.checkListId + "?editMode=false&formRef=" + body?.email);
      } else {
        this.alert.error(res.message);
      }
    },
      (err) => {
      });
  }

  redirectOnInit() {
    let body = {
      email: environment.signUpEmail,
      code: this.code
    }
    this.http.post('Guest/LoginGuest', body, true).subscribe(async (res: any) => {
      if (res.isPassed) {

        await localStorage.setItem('userData', JSON.stringify(res?.data?.userToken));
        await localStorage.setItem('token', JSON.stringify(res.data?.userToken?.resetToken));


        this.router.navigateByUrl("/page/checklist/" + res?.data?.checkListId + "?editMode=false&formRef=" + body?.email);
      } else {
        this.alert.error("Something Went Wrong !");
      }
    },
      (err) => {
      });

  }
}
