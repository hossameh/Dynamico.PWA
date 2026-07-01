import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

declare global {
    interface Window {
        onFlutterAuth?: (data: any) => void;
    }
}

@Injectable({
    providedIn: 'root'
})
export class FlutterBridgeService {

    constructor(private readonly router: Router, private readonly ngZone: NgZone) { }

    /**
     * Notify Flutter app when user logs in.
     * Sends accessToken, refreshToken, and userData so Flutter can persist and
     * return them when the app is reopened.
     * @param accessToken The access token from authentication
     * @param refreshToken The refresh token (optional)
     */
    notifyLogin(accessToken: string, refreshToken?: string): void {
        if (this.isFlutterWebView()) {
            try {
                const userData = localStorage.getItem('userData') || '';
                const payload = {
                    event: 'login',
                    accessToken,
                    refreshToken: refreshToken || '',
                    userData
                };

                (window as any).AuthChannel.postMessage(JSON.stringify(payload));
                console.log('✓ Flutter notified: login');
            } catch (error) {
                console.warn('Failed to notify Flutter on login:', error);
            }
        }
    }

    /**
     * Notify Flutter app when user logs out
     */
    notifyLogout(): void {
        if (this.isFlutterWebView()) {
            try {
                const payload = {
                    event: 'logout'
                };

                (window as any).AuthChannel.postMessage(JSON.stringify(payload));
                console.log('✓ Flutter notified: logout');
            } catch (error) {
                console.warn('Failed to notify Flutter on logout:', error);
            }
        }
    }

    /**
     * Register a global callback that Flutter calls when the app is reopened
     * with previously stored credentials.
     * Flutter should call: window.onFlutterAuth({ accessToken, userData })
     * where userData is the JSON string originally sent via notifyLogin.
     *
     * This restores localStorage and navigates to /page/home using the same
     * routing logic as the login flow — no window.location.reload().
     */
    listenForFlutterAuth(): void {
        window.onFlutterAuth = (data: any) => {
            console.log('Token received from Flutter:', data);

            if (!data?.accessToken) {
                console.warn('Flutter auth data missing accessToken, ignoring.');
                return;
            }

            // Only restore if there is no valid session already
            const existingToken = localStorage.getItem('token');
            if (existingToken && existingToken !== '{}') {
                console.log('Session already active, skipping Flutter auth restore.');
                return;
            }

            // Restore token (same format as login: JSON.stringify wraps the value)
            localStorage.setItem('token', JSON.stringify(data.accessToken));

            // Restore userData if Flutter sent it back
            if (data.userData) {
                // userData was stored as a JSON string; Flutter returns it as-is
                const userDataStr = typeof data.userData === 'string'
                    ? data.userData
                    : JSON.stringify(data.userData);
                localStorage.setItem('userData', userDataStr);
            }

            // Navigate using Angular Router inside NgZone (same as login routeToHome)
            this.ngZone.run(() => {
                this.router.navigate(['/page/home']);
            });
        };
    }

    /**
     * Check if the app is running inside a Flutter WebView
     * @returns true if Flutter channel is available
     */
    isFlutterWebView(): boolean {
        return typeof (window as any).AuthChannel !== 'undefined'
            && typeof (window as any).AuthChannel.postMessage === 'function';
    }
}
