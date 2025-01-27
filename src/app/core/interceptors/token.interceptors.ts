import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { LoadingService } from './../../services/loading/loading.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LangEnum } from '../enums/common.enum';

@Injectable({
  providedIn: 'root',
})

export class TokenInterceptor implements HttpInterceptor {

  private token: string | null = null;

  constructor(
    private readonly loadingService: LoadingService,
    private readonly http: HttpService,
    private readonly router: Router,
    private readonly alertService: AlertService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.token = JSON.parse(localStorage.getItem('token') || '{}');


    request = request.clone({
      setHeaders: {
        'Authorization': `Bearer ${this.token ? this.token : ''}`,
        'Access-Control-Allow-Origin': '*',
        'Language': localStorage.getItem('lang') || '{}',
        'Cache-Control': 'max-age=31536000'
      }
    });

    if (request.url.includes(environment.hostAPI)) {
      if (
        !request.url.includes('Notification/GetNotifications') &&
        !request.url.includes('Assets/GetUserAssets') &&
        !request.url.includes('Category/GetUserCategories') &&
        !request.url.includes('Category/GetCategoryChecklists') &&
        !request.url.includes('ChecklistRecords/ReadUserFormRecords') &&
        !request.url.includes('ChecklistRecords/GetPendingAndHistoryWorkflowFormData') &&
        !request.url.includes('ChecklistRecords/ReadFormRecords')
      )
        this.loadingService.setLoading(true, request.url);
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error && error.status === 401) {
            // 401 errors are most likely going to be because we have an expired token that we need to refresh.
            return throwError(error);
          }
          if (error && error.status === 424) {
            localStorage.clear();
            sessionStorage.clear();
            localStorage.setItem("lang", LangEnum.English);
            this.router.navigate(['/login']);
            return throwError(error);
          }
          else {
            // alertHandling
            if (error instanceof HttpErrorResponse) {
              if (error.status === 500 || error.status === 502 || error.status === 503) {
                this.alertService.error('Something Went Wrong !');
                console.log(error.error ? error.error.errorMessage ? error.error.errorMessage : '!Technical Error!' : '!Technical Error!');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!Technical Error!' : '!Technical Error!');
              } else if (error.status === 400) {
                this.alertService.error('Something Went Wrong !');
                console.log(error.error ? error.error.errorMessage ? error.error.errorMessage : '!BAD REQUEST!' : '!BAD REQUEST!');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!BAD REQUEST!' : '!BAD REQUEST!');
              } else if (error.status === 404) {
                this.alertService.error('Something Went Wrong !');
                console.log(error.error ? error.error.errorMessage ? error.error.errorMessage : '!METHOD NOT FOUND!' : '!METHOD NOT FOUND!');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!METHOD NOT FOUND!' : '!METHOD NOT FOUND!');
              } else if (error.status === 415) {
                this.alertService.error('Something Went Wrong !');
                console.log(error.error ? error.error.errorMessage ? error.error.errorMessage : 'Unsupported Media Type' : 'Unsupported Media Type');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : 'Unsupported Media Type' : 'Unsupported Media Type');
              } else {
                this.alertService.error('Something Went Wrong !');
                console.log(error.error ? error.error.errorMessage ? error.error.errorMessage : '!SYSTEM ERROR!' : '!SYSTEM ERROR!');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!SYSTEM ERROR!' : '!SYSTEM ERROR!');
              }
            }

            return throwError(error);
          }
        }),
        finalize(() => this.loadingService.setLoading(false, request.url))
      );
    } else {
      return next.handle(request);
    }
  }
}
