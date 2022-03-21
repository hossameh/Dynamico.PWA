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

  get<T>(APIName: string): Observable<T> {
    return this.http.get<API>(`${this.serverUrl}${APIName}`).pipe(map((event) => {
      return event.data;
    }));
  }

  post<T>(APIName: string, body?: any, showAlert = true): Observable<T> {
    return this.http.post<API>(`${this.serverUrl}${APIName}`, body ? body : null).pipe(map((event: any) => {
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
        this.alertService.error(event.errorMessage ? event.errorMessage : '!NOT HANDLED ERROR!');
      }
    }
  }
}
