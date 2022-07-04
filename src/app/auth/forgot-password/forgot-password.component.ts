import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private http: HttpService,
  ) { }

  linkSent: boolean = false;
  @ViewChild('f') forogtPasswordForm!: NgForm;
  userForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm()
  }

  onSubmit() {
    this.linkSent = false;
    try {
      let param = {
        Email: this.userForm.value.email,
        appName: environment.appName
      }
      this.http.post('Auth/ForgetPassword', null, true, param).subscribe((res: any) => {
        if (res.isPassed) {
          this.linkSent = true;
          localStorage.setItem('email', this.userForm.value.email)
        } else {
          this.alert.error(res?.message);
        }
      });
    } catch (err: any) {
      this.alert.error(err);
    }
  }

  get f() {
    return this.userForm.controls;
  }
  buildForm(): void {
    this.userForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]]
    });
  }

  formInit() {
    return {
      email: null
    };
  }
  resetData() {
    this.userForm.reset(this.formInit());
    this.userForm.updateValueAndValidity();
  }

}
