import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HttpService } from 'src/app/services/http/http.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  APIKey: any;
  canChange: any;
  userForm!: FormGroup;
  same: boolean = false;
  showPasswordText = false;
  companyName: string = environment.companyName;

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.route.queryParams.subscribe((params) => {
      this.APIKey = params["APIKey"];
      // if (this.APIKey) {
      //   this.validateApiKey();
      // } else {
      //   this.alert.error("Invalid Data");
      //   this.routeToLogin();
      // }
    });

  }

  buildForm(): void {
    this.userForm = this.fb.group({
      password: [null, [Validators.required, Validators.minLength(8),
        Validators.pattern(
          /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$-\/:-?{-~!"^_`\[\]@%$*])(?=.{8,})/
        )]],
      confirmPassword: [null],
    });
  }

  formInit() {
    return {
      password: null,
      confirmPassword: null
    };
  }
  get f() {
    return this.userForm.controls;
  }
  resetData() {
    this.userForm.reset(this.formInit());
    this.userForm.updateValueAndValidity();
  }
  showPassword() {
    this.showPasswordText = !this.showPasswordText;
  }
  // validateApiKey() {
  //   try {
  //     this.http.get2('Auth/ValidateForgetPassword', { APIKey: this.APIKey }).subscribe((res : any) => {                
  //       if (res && res.isPassed) {
  //         this.alert.success(res?.message);
  //       } else {
  //         this.alert.error(res?.message ? res?.message : "Invalid Token");
  //         this.routeToForgetPassword();
  //       }
  //     });
  //   } catch (error: any) {
  //     this.alert.error(error);
  //   }
  // }
  resetPassword() {
    try {
      let body = {
        apiKey: this.APIKey,
        newPassword: this.userForm.value.password
      }
      this.http.post('Auth/ResetForgetPassword', body).subscribe((res: any) => {
        if (res.isPassed) {
          this.alert.success(res?.message);
          this.routeToLogin();
        } else {
          this.alert.error("Something Went Wrong !");
        }
      });
    } catch (error: any) {
      this.alert.error("Something Went Wrong !");
    }
  }
  routeToLogin() {
    this.router.navigateByUrl('/login');
  }
  routeToForgetPassword() {
    this.router.navigateByUrl('/forgot');
  }
  checkPasswords() {
    if (this.userForm.controls.password.value === this.userForm.controls.confirmPassword.value) {
      this.same = true;
    } else {
      this.same = false
    }
  }

}
