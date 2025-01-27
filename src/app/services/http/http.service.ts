import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import { API } from 'src/app/core/interface/api.interface';



@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private serverUrl = environment.hostAPI;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  get<T>(APIName: string, params?: any): Observable<T> {
    return this.http.get<API>(`${this.serverUrl}${APIName}`, { params }).pipe(map((event) => {
      return event.data;
    }));
  }
  get2<T>(APIName: string, params?: any): Observable<T> {
    return this.http.get<API>(`${this.serverUrl}${APIName}`, { params }).pipe(map((event: any) => {
      return event;
    }));
  }

  post<T>(APIName: string, body?: any, showAlert = true, params?: any): Observable<T> {
    return this.http.post<API>(`${this.serverUrl}${APIName}`, body ? body : null, { params }).pipe(map((event: any) => {
      showAlert ? this.alertHandling(event) : '';
      return event;
    }));
  }

  put(APIName: string, body: any): Observable<any> {
    return this.http.put(`${this.serverUrl}${APIName}`, body).pipe(map((event: any) => {
      this.alertHandling(event);
      return event;
    }));
  }

  delete(APIName: string, body?: any): Observable<any> {
    return this.http.delete(`${this.serverUrl}${APIName}`).pipe(map((event: any) => {
      this.alertHandling(event);
      return event;
    }));
  }

  private alertHandling(event: any) {
    if (event.statusCode) {
      if (event.statusCode.toString().startsWith('2')) {
        this.alertService.success(event.successMessage ? event.successMessage : 'Successfully Done...');
      } else if (event.statusCode !== 200) {
        this.alertService.error(environment.friendlyErrorMessage);
        console.log(event.errorMessage ? event.errorMessage : '!NOT HANDLED ERROR!');
   
      }
    }
  }
}
