import { TranslateService } from '@ngx-translate/core';
import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { getMessaging, getToken } from 'firebase/messaging';
import { LangEnum } from 'src/app/core/enums/common.enum';
import { first } from 'rxjs/operators';
import { API } from 'src/app/core/interface/api.interface';
import { HelperService } from 'src/app/services/helper.service';
import { AuthType } from 'src/app/core/enums/AuthType';
import { LocationLoggerService } from '../../services/location-logger/location-logger.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  showPasswordText = false;
  authForm!: FormGroup;
  returnUrl!: string;
  currentLang!: string;
  passwordNeeded = false;
  loginKey = '';
  companyName: string = environment.companyName;
  userEmail: any;

  companyLogo :string = environment.companyLogo;

  constructor(private readonly router: Router, private logger: LocationLoggerService,
    private readonly FB: FormBuilder,
    private readonly alert: AlertService,
    private readonly translate: TranslateService,
    private readonly httpClient: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly http: HttpService,
    private readonly helper: HelperService) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.route.queryParams.subscribe((params) => {
      const data = params['data'];
      if (data) {
        this.processToken(data);
      }
    });

    this.BuildRequestForm();
    const lang = localStorage.getItem('lang') ?? '';
    this.currentLang = lang;
    //localStorage.clear();


    if (lang?.length === 2) // indicate to ar , en , fr not null
      this.langChanged(lang);
    else
      this.langChanged(LangEnum.English);

  }

  generateSignature(responseAsStr: string) {
    const signature = responseAsStr?.length + responseAsStr?.charCodeAt(0) + responseAsStr?.charCodeAt(responseAsStr?.length - 1);
    return signature;
  }
  processToken(token: string) {
    try {
      this.loginKey = '';
      const decodedTxt = this.helper.decryptnBToa(token);

      if (!decodedTxt) {
        this.alert.error('Login_Attemp_Failed');
        return;
      }
      const splittedArr = decodedTxt.split('._');
      const responseAsStr = splittedArr[0];
      const responseSignature = splittedArr[1];
      if (responseAsStr && responseSignature) {
        const signature = this.generateSignature(responseAsStr);
        if (responseSignature === signature?.toString()) {
          const response = JSON.parse(responseAsStr);
          if (response.IsPassed) {
            this.loginKey = response.Data;
            this.loginWithKey(response.Data);
          }
          else {
            this.alert.error('Login_Attemp_Failed');
          }
        }
        else {
          this.alert.error('Login_Attemp_Failed');
        }
      }
      else {
        this.alert.error('Login_Attemp_Failed');
      }

    }
    catch (error) {
      this.alert.error('Login_Attemp_Failed');
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

  }


  BuildRequestForm() {
    this.authForm = this.FB.group({
      username: [null, [Validators.required]],
      password: [null],
    });
  }

  showPassword() {
    this.showPasswordText = !this.showPasswordText;
  }
  get f() {
    return this.authForm.controls;
  }

  setUserData(res: API) {
    localStorage.setItem('userData', JSON.stringify(res.data));
    localStorage.setItem('token', JSON.stringify(res.data.resetToken));
  }

  handleLoginResponse(res: API , authType:AuthType) {
    try {
      if (res.data && res.isPassed) {
        this.setUserData(res);
        this.userEmail = JSON.parse(localStorage.getItem('userData') || '{}').userEmail;
        this.logger.startLogger(this.userEmail);

        if (res?.data?.defaultLanguage && this.currentLang && this.currentLang !== res?.data?.defaultLanguage) {
          localStorage.setItem('lang', res?.data?.defaultLanguage);
          this.langChanged(res?.data?.defaultLanguage);
        }
        this.CheckFCMTokenExpiration(res.data);
        this.routeToHome();
        
      }
      else if (res?.data?.username) {
        this.alert.confirmAny(res?.message, "Logout From Other Devices", "Cancel")
          .then((result) => {
            if (result.value) {
             
              this.reLogin(this.authForm.value , authType);
            }
          });
      }
      else {
        this.alert.error(res?.message);
      }
    }
    catch (err) {
      this.alert.error(environment.friendlyErrorMessage);
    }


  }


login(body:any){
  
  this.http.post<API>('Auth/Login', body, true)
  .pipe(first())
  .subscribe((res: API) => {
    this.handleLoginResponse(res,AuthType.BasicAuth);
  },
    (err) => {
      this.alert.error(environment.friendlyErrorMessage);
    });
}

  loginWithPassword() {
    if (this.authForm.invalid)
      return;

    const body = this.authForm.value;
    body.appName = environment.appName;

    this.login(body);
  }

  loginWithKey(key: string) {
    try {
      this.http.post<API>('Auth/LoginWithKey', { key: key, appName: environment.appName }, true)
        .pipe(first())
        .subscribe((res: API) => {
          this.handleLoginResponse(res ,AuthType.SAML);
        },
          (err) => {
            this.alert.error(environment.friendlyErrorMessage);
          });

    }
    catch (err) {
      this.alert.error(environment.friendlyErrorMessage);
    }
  }
  async reLogin(body: any , authType?:AuthType) {

    const userName = this.authForm.get('username')?.value ? this.authForm.get('username')?.value : localStorage.getItem('tempDynamicoUserName');

    if(userName){

      const response:API = await this.logoutFromOtherDevices(userName).toPromise();
      if (response.isPassed){

        switch(authType){
          case AuthType.SAML:
            this.loginWithKey(this.loginKey);
            break;

            case AuthType.SingleCode:
              this.checkEmail(userName);
              break;

            default:
              this.login(body);
              break;
        }
        
      }
      else {
        this.alert.error(response?.message);
      }

    }

  
  }
  logoutFromOtherDevices(userName: any) {
    let url = `Auth/logout?UserName=${userName}`;
    return this.http.post<API>(`${url}`, null);
  }

  onSubmitClicked() {
   this.passwordNeeded ? this.loginWithPassword() : this.checkEmail(this.authForm.get('username')?.value);

  }

  async checkEmail(email: string) {
    try {

      if (this.authForm.invalid)
        return;

      const res: API = await this.http.get2<API>('Auth/VerifyAccountAuth',
         { Username: this.authForm.get('username')?.value ,appName:environment.redirectUrl }).toPromise();
      if (res.isPassed) {
        switch(res.data.authType){
          case AuthType.SAML:
            localStorage.setItem('tempDynamicoUserName', this.authForm.get('username')?.value);
            setTimeout(() => {
              window.location.href = res.data.url;
            }, 500);
            break;

            case AuthType.SingleCode:
              this.handleLoginResponse(res.data.loginData ,AuthType.SingleCode);
              break;

            default:
              setTimeout(() => {
                this.passwordNeeded = true;
                this.changeControlValidation(this.authForm.get('password'), false);
              })
              break;
        }

      }

      else {
        this.alert.error(res?.message);
      }


    }
    catch (err) {
      this.alert.error(environment.friendlyErrorMessage);
    }
  }

  CheckFCMTokenExpiration(returnObject: any) {

    let fcmTokenExpiration = returnObject?.fcmTokenExpiryDate;
    if (fcmTokenExpiration) {
      localStorage.setItem('fcmTokenExpireDate', fcmTokenExpiration);
    
    }
    else {
      const messaging = getMessaging();

      getToken(messaging, { vapidKey: environment.firebase.vapidKey }).then((currentToken: any) => {
        if (currentToken) {
          // Send the token to your server and update the UI if necessary
          this.updateFCMToken(currentToken, returnObject).then((res) => {
            this.routeToHome();
          });
        } else {
          console.log("No registration token available. Request permission to generate one.");
          this.alert.error("Something Went Wrong !");
          this.routeToHome();
        }
      }).catch((err: any) => {
        console.log(err);
       // this.alert.error("Something Went Wrong !");
    
      });

    }
  }

  routeToHome() {
    if (this.returnUrl != '/') {
      this.router.navigateByUrl(this.returnUrl);
    }
    else
      this.router.navigate(['/page/home']);
  }
  async updateFCMToken(fcmToken: any, returnObject: any) {
    try {
      let userId = returnObject.userId;
      let authToken = returnObject.resetToken;
      let body = {
        token: fcmToken,
        userId: userId
      };
      const res: any = await this.updateUserFCMToken(body, authToken);
      console.log(res);

      if (res.isPassed) {
        let fcmTokenExpiration = res.data;
        localStorage.setItem('fcmTokenExpireDate', fcmTokenExpiration);
        console.log("fcmTokenExpireDate", fcmTokenExpiration);

      }
      else {
        this.alert.error('Failed To Update FCM Token');
      }
    }
    catch (err) {
      this.alert.error('Failed To Update FCM Token');
    };
  }
  updateUserFCMToken(body: any, authToken: any) {
    return this.httpClient.post(`${environment.hostAPI + "Notification/AddOrUpdateUserBrowserToken"}`, body, {
      headers: {
        "Authorization": `Bearer ${authToken ? authToken : ''}`
      }
    }).toPromise();
  }


  changeControlValidation(control: any, clearValidation = true) {
    if (clearValidation) {
      control.clearValidators();
      control.setErrors(null);
    }
    else {
      control.setValidators([Validators.required, Validators.minLength(6),
      Validators.pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$-\/:-?{-~!"^_`\[\]@%$*])(?=.{6,})/
      )]);
      control.setErrors({ required: true });
    }
    control.updateValueAndValidity();
  }

  //onSignUpClicked() {

  //  window.open('https://app-mystro.dynamico.cloud/GuestLogin?code=51b5c671-7514-40c0-b6f2-20e240bc0fad', '_blank');

  //}
  onSignUpClicked() {
    const url = `${environment.mystroGuestLoginBaseUrl}?code=${environment.mystroGuestLoginCode}`;
    window.open(url, '_blank');
  }
}
