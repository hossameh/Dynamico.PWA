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
import { FlutterBridgeService } from '../../services/flutter-bridge/flutter-bridge.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  version = environment.version
  userData: any;

  // Change Password
  passForm!: FormGroup;
  showOld = false;
  showPass = false;
  showConfirm = false;
  same = false;
  isChangingPassword = false;

  constructor(public readonly translate: TranslateService, private logger: LocationLoggerService,
    private readonly http: HttpService,
    private readonly alert: AlertService,
    private readonly router: Router,
    private readonly helper: HelperService,
    private readonly flutterBridge: FlutterBridgeService,
    private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
    this.buildPassForm();
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

        // Notify Flutter app about logout
        this.flutterBridge.notifyLogout();

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

  /******************Change Password******************/
  buildPassForm() {
    this.passForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$\-\/:-?{-~!"^_`\[\]@%$*])(?=.{8,})/)
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  checkPasswords() {
    this.same = this.passForm.get('newPassword')?.value === this.passForm.get('confirmPassword')?.value;
  }

  togglePassword(control: string) {
    if (control === 'old') this.showOld = !this.showOld;
    else if (control === 'pass') this.showPass = !this.showPass;
    else if (control === 'confirm') this.showConfirm = !this.showConfirm;
  }

  openChangePasswordModal() {
    this.passForm.reset();
    this.same = false;
    this.showOld = false;
    this.showPass = false;
    this.showConfirm = false;
  }

  changeUserPassword() {
    if (this.passForm.invalid || !this.same) return;
    this.isChangingPassword = true;
    const body = {
      userId: this.userData?.userId,
      password: this.passForm.get('newPassword')?.value,
      oldPassword: this.passForm.get('oldPassword')?.value
    };
    this.http.post<any>(environment.ChangeUserPassword, body, false).subscribe(
      (res: any) => {
        this.isChangingPassword = false;
        if (res?.isPassed) {
          this.alert.success(this.alert.getTranslation('Password Changed Successfully'));
          // Close modal
          const modalEl = document.getElementById('changePasswordModal');
          if (modalEl) {
            const bsModal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
            bsModal?.hide();
          }
          this.passForm.reset();
          this.same = false;
        } else {
          this.alert.error(res?.message || this.alert.getTranslation('Something Went Wrong !'));
        }
      },
      (error) => {
        this.isChangingPassword = false;
        this.alert.error(error?.message || this.alert.getTranslation('Something Went Wrong !'));
      }
    );
  }


}
