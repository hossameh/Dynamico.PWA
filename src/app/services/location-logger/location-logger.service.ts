// location-logger.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, fromEvent } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationLoggerService {
  private timerSubscription: Subscription | null = null;
  private cacheKey = 'offlineLocationLogs';

  constructor(private http: HttpClient) {
    this.setupOnlineListener();
  }

  startLogger(userEmail: string): void {
    if (!environment.locationLogger.activateLocationLogger) return;

    this.timerSubscription = interval(environment.locationLogger.timer).subscribe(() => {
      const now = new Date();
      const start = this.parseTime(environment.locationLogger.dayStart);
      const end = this.parseTime(environment.locationLogger.dayEnd);

      if (now >= start && now <= end) {
        this.logLocation(userEmail);
      }
    });
  }

  stopLogger(): void {
    this.timerSubscription?.unsubscribe();
  }

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private logLocation(userEmail: string): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const dateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 23);
        const location = `${position.coords.latitude},${position.coords.longitude}`;

        const formData = [
          { name: 'userEmail', value: userEmail },
          { name: 'dateTime', value: dateTime },
          { name: 'location', value: location },
          { name: 'submit', value: true }
        ];

        const data = {
          Action: 'Add',
          FormDataRef: '',
          Form_Data: JSON.stringify(formData),
          Form_Id: environment.locationLogger.formId, 
          Record_Id: 0,         
          isSubmitted: false,
          location
        };

        if (navigator.onLine) {
          this.sendLog(data);
        } else {
          this.cacheLog(data);
        }
      },
      error => {
        console.error('Geolocation error:', error);
      }
    );
  }


  private sendLog(data: any): void {
    this.http.post(environment.apiEndpoint, data).subscribe({
      next: () => this.cacheLog('Location sent'),
      error: err => {
        this.cacheLog(data);
      }
    });
  }

  private cacheLog(data: any): void {
    const logs = this.getCachedLogs();
    logs.push(data);
    localStorage.setItem(this.cacheKey, JSON.stringify(logs));
  }

  private getCachedLogs(): any[] {
    const json = localStorage.getItem(this.cacheKey);
    return json ? JSON.parse(json) : [];
  }

  private setupOnlineListener(): void {
    fromEvent(window, 'online').subscribe(() => {
      const logs = this.getCachedLogs();
      if (logs.length === 0) return;

      const failedLogs: any[] = [];
      logs.forEach(log => {
        this.http.post(environment.apiEndpoint, log).subscribe({
          next: () => this.cacheLog('Cached log sent')  ,
          error: () => {
            failedLogs.push(log);
          }
        });
      });

      setTimeout(() => {
        if (failedLogs.length > 0) {
          localStorage.setItem(this.cacheKey, JSON.stringify(failedLogs));
        } else {
          localStorage.removeItem(this.cacheKey);
        }
      }, 3000); // Allow some time for requests to finish
    });
  }
}
