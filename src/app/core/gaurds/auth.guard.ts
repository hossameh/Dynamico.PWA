import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { FormioConfigService } from 'src/app/services/formio-config/formio-config.service';
import { Role } from '../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthGard implements CanActivateChild {
  role = Role;
  constructor(private router: Router, private formioService: FormioConfigService) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.formioService.interceptFormioRequests();
    if (state.url.includes("workflow/details") && route.queryParams.token) {
      let token = route.queryParams.token;
      this.setToken(token).then(() => {
        return true;
      })
    }
    if (state.url.includes("page/app-checklist") && route.queryParams.token) {
      let token = route.queryParams.token;
      this.setToken(token).then(() => {
        return true;
      })
    }
    let role = JSON.parse(localStorage.getItem('userData') || '{}').userType;
    if ((state.url.includes("page/checklist") || role != this.role.Anonymous) && (localStorage.getItem('token') || sessionStorage.getItem('token'))) {
      return true;
    }
    if (role && role == this.role.Anonymous)
      this.router.navigate(['/externallogin']);
    else
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  async setToken(token: any): Promise<void> {
    await localStorage.setItem('token', JSON.stringify(token));
    await sessionStorage.setItem('token', JSON.stringify(token));
  }

}
