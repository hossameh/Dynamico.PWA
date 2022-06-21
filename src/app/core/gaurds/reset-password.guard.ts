import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert/alert.service';
import { HttpService } from 'src/app/services/http/http.service';

@Injectable({
    providedIn: 'root'
})
export class ResetPasswordGuard implements CanActivate {
    constructor(private router: Router, private http: HttpService, private alert: AlertService) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let token = route.queryParams.APIKey;
        if (token) {
            return this.http.get2('User/ValidateForgetPassword', { APIKey: token }).
                pipe(
                    map(
                        (res: any) => {
                            if (res.isPassed)
                                return true;
                            else {
                                this.router.navigateByUrl('/login');
                                this.alert.error(res?.message);
                                return false;
                            }
                        }),
                    catchError((err, caught) => {
                        this.router.navigate(['/pages/error']);
                        return of(false);
                    }));
        }
        else {
            this.router.navigateByUrl('/login');
            return false;
        }
    }

}