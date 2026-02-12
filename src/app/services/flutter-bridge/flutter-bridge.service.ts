import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FlutterBridgeService {

    constructor() { }

    /**
     * Notify Flutter app when user logs in
     * @param accessToken The access token from authentication
     * @param refreshToken The refresh token (optional)
     */
    notifyLogin(accessToken: string, refreshToken?: string): void {
        if (this.isFlutterWebView()) {
            try {
                const payload = {
                    event: 'login',
                    accessToken,
                    refreshToken: refreshToken || ''
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
     * Check if the app is running inside a Flutter WebView
     * @returns true if Flutter channel is available
     */
    private isFlutterWebView(): boolean {
        return typeof (window as any).AuthChannel !== 'undefined'
            && typeof (window as any).AuthChannel.postMessage === 'function';
    }
}
