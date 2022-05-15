import { TranslateService } from '@ngx-translate/core';
import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  version = environment.version
  userData:any
  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
  }

  langChanged(lang: any) {
    // const elEn = document.querySelector('#bootstrap-en');
    // const elAr = document.querySelector('#bootstrap-ar');
    this.translate.use(lang)
    localStorage.setItem('lang',lang)
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


  logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
  }
}
