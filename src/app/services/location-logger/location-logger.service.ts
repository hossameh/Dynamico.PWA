// location-logger.service.ts
import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BackgroundGeolocation, Location, CallbackError } from '@capgo/background-geolocation';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

// Tag for console logging
const TAG = 'LocationLogger';

@Injectable({
  providedIn: 'root'
})
export class LocationLoggerService implements OnDestroy {
  private onlineSubscription: Subscription | null = null;
  private cacheKey = 'offlineLocationLogs';
  private currentUserEmail: string | null = null;
  private isTracking = false;

  // Time-based throttling
  private lastLogTime: number = 0;
  private logInterval: number = environment.locationLogger.timer;

  constructor(
    private http: HttpClient,
    private zone: NgZone
  ) {
    this.setupOnlineListener();
  }

  ngOnDestroy(): void {
    this.stopLogger();
    this.onlineSubscription?.unsubscribe();
  }

  /**
   * Get authorization headers from localStorage (same as TokenInterceptor)
   */
  private getAuthHeaders(): { [key: string]: string } {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    const lang = localStorage.getItem('lang') || 'en';

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token ? token : ''}`,
      'Access-Control-Allow-Origin': '*',
      'Language': lang,
      'Cache-Control': 'max-age=31536000'
    };
  }

  /**
   * Start the background location logger.
   * Call this after user login.
   */
  async startLogger(userEmail: string): Promise<void> {
    if (!environment.locationLogger.activateLocationLogger) {
      console.log(`[${TAG}] Location logger disabled in environment config`);
      return;
    }

    if (this.isTracking) {
      console.log(`[${TAG}] Already tracking, skipping start`);
      return;
    }

    this.currentUserEmail = userEmail;
    this.lastLogTime = 0;

    const intervalMinutes = this.logInterval / 60000;
    console.log(`[${TAG}] Starting background location logger for user: ${userEmail}`);
    console.log(`[${TAG}] Log interval: ${intervalMinutes} minute(s) (${this.logInterval}ms)`);

    try {
      await BackgroundGeolocation.start(
        {
          backgroundTitle: environment.appTitle || 'Beyti',
          backgroundMessage: 'Location tracking active',
          requestPermissions: true,
          stale: false,
          distanceFilter: 0
        },
        (location: Location | undefined, error: CallbackError | undefined) => {
          this.zone.run(() => {
            if (error) {
              console.error(`[${TAG}] Location error:`, error);
              if (error.code === 'NOT_AUTHORIZED') {
                console.warn(`[${TAG}] Location permission denied. Opening settings...`);
                BackgroundGeolocation.openSettings();
              }
              return;
            }

            if (location) {
              console.log(`[${TAG}] Location received:`, location.latitude, location.longitude);

              if (!this.isWithinSchedule()) {
                console.log(`[${TAG}] Outside schedule, skipping location log`);
                return;
              }

              const now = Date.now();
              const timeSinceLastLog = now - this.lastLogTime;

              if (timeSinceLastLog >= this.logInterval) {
                console.log(`[${TAG}] Timer interval reached, logging location`);
                this.lastLogTime = now;
                this.processLocation(location);
              } else {
                const remainingMs = this.logInterval - timeSinceLastLog;
                console.log(`[${TAG}] Skipping - next log in ${Math.round(remainingMs / 1000)}s`);
              }
            }
          });
        }
      );

      this.isTracking = true;
      console.log(`[${TAG}] Background geolocation started successfully`);
      this.sendCachedLogs();

    } catch (error) {
      console.error(`[${TAG}] Failed to start background geolocation:`, error);
    }
  }

  async stopLogger(): Promise<void> {
    console.log(`[${TAG}] Stopping location logger`);

    try {
      if (this.isTracking) {
        await BackgroundGeolocation.stop();
        console.log(`[${TAG}] Background geolocation stopped`);
      }
    } catch (error) {
      console.error(`[${TAG}] Error stopping background geolocation:`, error);
    }

    this.currentUserEmail = null;
    this.isTracking = false;
    this.lastLogTime = 0;
  }

  private isWithinSchedule(): boolean {
    const now = new Date();
    const start = this.parseTime(environment.locationLogger.dayStart);
    const end = this.parseTime(environment.locationLogger.dayEnd);
    return now >= start && now <= end;
  }

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private processLocation(location: Location): void {
    if (!this.currentUserEmail) {
      console.warn(`[${TAG}] No user email set, skipping location log`);
      return;
    }

    const dateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 23);
    const locationStr = `${location.latitude},${location.longitude}`;

    console.log(`[${TAG}] Processing location: ${locationStr} at ${dateTime}`);

    const formData = [
      { name: 'userEmail', value: this.currentUserEmail },
      { name: 'dateTime', value: dateTime },
      { name: 'location', value: locationStr },
      { name: 'submit', value: true }
    ];

    const data = {
      Action: 'Add',
      FormDataRef: '',
      Form_Data: JSON.stringify(formData),
      Form_Id: environment.locationLogger.formId,
      Record_Id: 0,
      isSubmitted: false,
      location: locationStr
    };

    this.sendLogNative(data);
  }

  /**
   * Send log using Capacitor native HTTP with auth headers
   */
  private async sendLogNative(data: any): Promise<void> {
    console.log(`[${TAG}] Sending location via native HTTP`);

    try {
      const response: HttpResponse = await CapacitorHttp.post({
        url: environment.apiEndpoint,
        headers: this.getAuthHeaders(),
        data: data
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`[${TAG}] Location logged successfully (native HTTP)`);
      } else {
        console.error(`[${TAG}] HTTP error ${response.status}, caching location`);
        this.cacheLog(data);
      }
    } catch (error) {
      console.error(`[${TAG}] Native HTTP failed, caching:`, error);
      this.cacheLog(data);
    }
  }

  private cacheLog(data: any): void {
    const logs = this.getCachedLogs();
    logs.push(data);
    localStorage.setItem(this.cacheKey, JSON.stringify(logs));
    console.log(`[${TAG}] Location cached. Total cached: ${logs.length}`);
  }

  private getCachedLogs(): any[] {
    const json = localStorage.getItem(this.cacheKey);
    if (!json) return [];

    try {
      const logs = JSON.parse(json);
      return logs.filter((log: any) => typeof log === 'object' && log !== null);
    } catch {
      return [];
    }
  }

  private setupOnlineListener(): void {
    this.onlineSubscription = fromEvent(window, 'online').subscribe(() => {
      console.log(`[${TAG}] Device came online, sending cached logs`);
      this.sendCachedLogs();
    });
  }

  private async sendCachedLogs(): Promise<void> {
    const logs = this.getCachedLogs();
    if (logs.length === 0) return;

    console.log(`[${TAG}] Sending ${logs.length} cached logs via native HTTP`);
    localStorage.removeItem(this.cacheKey);

    const headers = this.getAuthHeaders();

    for (const log of logs) {
      try {
        const response = await CapacitorHttp.post({
          url: environment.apiEndpoint,
          headers: headers,
          data: log
        });

        if (response.status >= 200 && response.status < 300) {
          console.log(`[${TAG}] Cached log sent successfully`);
        } else {
          console.error(`[${TAG}] Failed to send cached log (${response.status}), re-caching`);
          this.cacheLog(log);
        }
      } catch (error) {
        console.error(`[${TAG}] Error sending cached log:`, error);
        this.cacheLog(log);
      }
    }
  }
}
