import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { LoadingService } from './../../services/loading/loading.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { clearStoredSession } from '../utils/token.utils';

@Injectable({
  providedIn: 'root',
})

export class TokenInterceptor implements HttpInterceptor {

  private token: string | null = null;

  /** Stops a burst of parallel 401s from each tearing down and re-navigating. */
  private sessionTeardownInProgress = false;

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
          if (error && (error.status === 401 || error.status === 424)) {
            // The session is gone as far as the server is concerned.
            // 401 used to just rethrow here, and because most callers subscribe
            // without an error handler their loading flags stayed latched on —
            // the user was left staring at a spinner with no route back to login.
            this.forceReLogin();
            return throwError(error);
          }
          else {
            // alertHandling
            if (error instanceof HttpErrorResponse) {
              if (error.status === 500 || error.status === 502 || error.status === 503) {
                this.alertService.error('Something Went Wrong !');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!Technical Error!' : '!Technical Error!');
              } else if (error.status === 400) {
                this.alertService.error('Something Went Wrong !');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!BAD REQUEST!' : '!BAD REQUEST!');
              } else if (error.status === 404) {
                this.alertService.error('Something Went Wrong !');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : '!METHOD NOT FOUND!' : '!METHOD NOT FOUND!');
              } else if (error.status === 415) {
                this.alertService.error('Something Went Wrong !');
                // this.alertService.error(error.error ? error.error.errorMessage ? error.error.errorMessage : 'Unsupported Media Type' : 'Unsupported Media Type');
              } else {
                this.alertService.error('Something Went Wrong !');
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

  /** Drops the dead session and sends the user back to the login form. */
  private forceReLogin(): void {
    if (this.sessionTeardownInProgress) {
      return;
    }
    this.sessionTeardownInProgress = true;

    clearStoredSession();

    const release = () => { this.sessionTeardownInProgress = false; };
    this.router.navigate(['/login']).then(release, release);
  }
}
