import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API } from 'src/app/core/interface/api.interface';

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
    private http: HttpService) { }

  ngOnInit(): void {
    this.BuildRequestForm();
    localStorage.clear();
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

    this.http.post('User/authenticate', this.authForm.value, true).subscribe((res: any) => {
      if (res.isPassed) {
        localStorage.setItem('userData', JSON.stringify(res.data));
        localStorage.setItem('token', JSON.stringify(res.data.resetToken));
        this.router.navigate(['/page/home']);
      } else {
        this.alert.error(res.message);
      }
    },
      (err) => {
        console.log('err', err);
      });


  }
}
