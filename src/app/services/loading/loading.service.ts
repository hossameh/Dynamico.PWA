import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading = new BehaviorSubject<boolean>(false);
  loadingMap: Map<string, boolean> = new Map<string, boolean>();

  constructor() { }

  /**
   * Sets the isLoading property value based on the following:
   * - If loading is true, add the provided url to the loadingMap with a true value, set isLoading value to true
   * - If loading is false, remove the loadingMap entry and only when the map is empty will we set isLoading to false
   * This pattern ensures if there are multiple requests awaiting completion, we don't set loading to false before
   * other requests have completed. At the moment, this function is only called from the @link{HttpRequestInterceptor}
   * @param loading {boolean}
   * @param url {string}
   */
  setLoading(loading: boolean, url: string): void {
    if (!url) {
      throw new Error('The request URL must be provided to the LoadingService.setLoading function');
    }

    if (loading) {
      this.loadingMap.set(url, loading);
      this.isLoading.next(true);
    } else if (!loading && this.loadingMap.has(url)) {
      this.loadingMap.delete(url);
    }

    if (this.loadingMap.size === 0) {
      this.isLoading.next(false);
    }
  }
}
