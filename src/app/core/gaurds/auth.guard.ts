import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGard implements CanActivateChild {
  constructor( private router: Router){}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if((localStorage.getItem('token') || sessionStorage.getItem('token'))){
        return true;
      }

      this.router.navigate(['/login'])
    return false;
  }

}
