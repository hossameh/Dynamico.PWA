import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { Role } from '../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthGard implements CanActivateChild {
  role = Role;
  constructor(private router: Router) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
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

}
