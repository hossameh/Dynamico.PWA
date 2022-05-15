import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API } from 'src/app/core/interface/api.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { getMessaging, getToken } from 'firebase/messaging';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  showPasswordText = false;
  authForm!: FormGroup;

  constructor(private router: Router, private FB: FormBuilder,
    private alert: AlertService,
    private httpClient: HttpClient,
    private http: HttpService) { }

  ngOnInit(): void {
    this.BuildRequestForm();
    const lang = localStorage.getItem('lang') || '{}';
    localStorage.clear();
   localStorage.setItem('lang',lang)

  }

  BuildRequestForm() {
    this.authForm = this.FB.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8),
      Validators.pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$-\/:-?{-~!"^_`\[\]@%$*])(?=.{8,})/
      )]],
      // companyCode: []
    });
  }

  showPassword() {
    this.showPasswordText = !this.showPasswordText;
  }
  get f() {
    return this.authForm.controls;
  }
  login() {
    let body = this.authForm.value;
    body.appName = environment.appName;
    this.http.post('User/authenticate', body, true).subscribe((res: any) => {
      if (res.isPassed) {
        localStorage.setItem('userData', JSON.stringify(res.data));
        localStorage.setItem('token', JSON.stringify(res.data.resetToken));

        this.CheckFCMTokenExpiration(res.data);
        //this.routeToHome();

      } else {
        this.alert.error(res.message);
      }
    },
      (err) => {
        console.log('err', err);
      });
  }

  CheckFCMTokenExpiration(returnObject: any) {

    let fcmTokenExpiration = returnObject?.fcmTokenExpiryDate;
    if (fcmTokenExpiration) {
      localStorage.setItem('fcmTokenExpireDate', fcmTokenExpiration);
      this.routeToHome();
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
          this.alert.error('No registration token available. Request permission to generate one.')
          this.routeToHome();
        }
      }).catch((err: any) => {
        this.alert.error(err)
        this.routeToHome();
      });

    }
  }

  routeToHome() {
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
        console.log("fcmTokenExpireDate",fcmTokenExpiration);

      }
      else {
        this.alert.error('Failed To Update FCM Token')
      }
    }
    catch (err) {
      this.alert.error('Failed To Update FCM Token')
    };
  }
  updateUserFCMToken(body: any, authToken: any) {
    return this.httpClient.post(`${environment.hostAPI + "Notification/AddOrUpdateUserBrowserToken"}`, body, {
      headers: {
        "Authorization": `Bearer ${authToken ? authToken : ''}`
      }
    }).toPromise()
  }
}
