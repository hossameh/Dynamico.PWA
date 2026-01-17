// location-logger.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, fromEvent, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationLoggerService implements OnDestroy {
  private timerSubscription: Subscription | null = null;
  private onlineSubscription: Subscription | null = null;
  private cacheKey = 'offlineLocationLogs';
  private currentUserEmail: string | null = null;

  constructor(private http: HttpClient) {
    this.setupOnlineListener();
  }

  ngOnDestroy(): void {
    this.stopLogger();
    this.onlineSubscription?.unsubscribe();
  }

  startLogger(userEmail: string): void {
    if (!environment.locationLogger.activateLocationLogger) return;

    this.currentUserEmail = userEmail;

    // Log immediately on login (if within schedule)
    this.logLocationIfInSchedule(userEmail);

    // Then start the interval for subsequent logs
    this.timerSubscription = interval(environment.locationLogger.timer).subscribe(() => {
      this.logLocationIfInSchedule(userEmail);
    });

    // Also try to send any previously cached logs
    this.sendCachedLogs();
  }

  stopLogger(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = null;
    this.currentUserEmail = null;
  }

  private logLocationIfInSchedule(userEmail: string): void {
    const now = new Date();
    const start = this.parseTime(environment.locationLogger.dayStart);
    const end = this.parseTime(environment.locationLogger.dayEnd);

    if (now >= start && now <= end) {
      this.logLocation(userEmail);
    }
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
        const dateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 23);
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
      next: () => console.log('Location logged successfully'),
      error: () => this.cacheLog(data)
    });
  }

  private cacheLog(data: any): void {
    const logs = this.getCachedLogs();
    logs.push(data);
    localStorage.setItem(this.cacheKey, JSON.stringify(logs));
  }

  private getCachedLogs(): any[] {
    const json = localStorage.getItem(this.cacheKey);
    if (!json) return [];

    try {
      const logs = JSON.parse(json);
      // Filter out any string entries (garbage from previous bug)
      return logs.filter((log: any) => typeof log === 'object' && log !== null);
    } catch {
      return [];
    }
  }

  private setupOnlineListener(): void {
    this.onlineSubscription = fromEvent(window, 'online').subscribe(() => {
      this.sendCachedLogs();
    });
  }

  private sendCachedLogs(): void {
    const logs = this.getCachedLogs();
    if (logs.length === 0) return;

    // Clear cache immediately to prevent duplicates
    localStorage.removeItem(this.cacheKey);

    // Use forkJoin to properly wait for all requests
    const requests = logs.map(log =>
      this.http.post(environment.apiEndpoint, log).pipe(
        catchError(() => {
          // Re-cache failed logs
          this.cacheLog(log);
          return of(null);
        })
      )
    );

    forkJoin(requests).subscribe();
  }
}
