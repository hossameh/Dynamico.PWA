import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  currentLang: BehaviorSubject<string> = new BehaviorSubject('ar');
  checklistData: BehaviorSubject<any> = new BehaviorSubject(null);
  getingCount: BehaviorSubject<any> = new BehaviorSubject(null);
  getingNotificationCount: BehaviorSubject<any> = new BehaviorSubject(null);

  isOnline = true;
  userId: any;

  constructor(
    private http: HttpService,
    private storage: Storage,
    private translate: TranslateService
  ) {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
  }

  async getNotificationCount() {
    let notificationCounts = await this.storage.get("NotificationCounts") || [];
    let userNotificationCount: any = Object.values(notificationCounts).filter((el: any) => el.userId == this.userId)[0];
    notificationCounts = Object.values(notificationCounts).filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body = {
        UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
        isRead: false
      }
      try {
        this.http.post('Notification/GetNotificationCount', body).subscribe(async (res: any) => {
          this.getingNotificationCount.next(+res.data);
          let obj = {
            userId: this.userId,
            count: +res.data
          };
          notificationCounts.push(obj);
          await this.storage.set("NotificationCounts", notificationCounts);
        })
      }
      catch (ex) { }
    }
    else{
      let count = userNotificationCount ? userNotificationCount.count : 0;
      this.getingNotificationCount.next(count);
    }
  }
  async getWorkflowCount() {
    let pendingWorkflowCounts = await this.storage.get("PendingWorkflowCounts") || [];
    let userPendingWorkflowCounts: any = Object.values(pendingWorkflowCounts).filter((el: any) => el.userId == this.userId)[0];
    pendingWorkflowCounts = Object.values(pendingWorkflowCounts).filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      try {
        this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(async res => {
          this.getingCount.next(res);
          let obj = {
            userId: this.userId,
            count: res
          };
          pendingWorkflowCounts.push(obj);
          await this.storage.set("PendingWorkflowCounts", pendingWorkflowCounts);
        })
      }
      catch (ex) { }
    }
    else {
      let count = userPendingWorkflowCounts ? userPendingWorkflowCounts.count : 0;
      this.getingCount.next(count);
    }
  }
  getTranslation(wordYouNeedToTranslate: string): string {
    return this.translate.instant(wordYouNeedToTranslate);
  }

  encryptionBToa(value: string | object) {
    try {
      if (typeof value === 'object')
        value = JSON.stringify(value);

      const converted = this.toBinary(value);
      const encryptedText = btoa(converted);
      return encryptedText;
    }
    catch (ex)
    {
      return '';
    }

   
  }
  decryptnBToa(value: string) {
    try {

      const decoded = atob(value);
      const original = this.fromBinary(decoded);
      return original;
    }
    catch (e) {
      return '';
    }
  }

  toBinary(text:string) {
    const codeUnits = Uint16Array.from(
      { length: text.length },
      (element, index) => text.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);

    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  fromBinary(binary:any) {
    const bytes = Uint8Array.from({ length: binary.length }, (element, index) =>
      binary.charCodeAt(index)
    );
    const charCodes = new Uint16Array(bytes.buffer);

    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }


  openLogoutWindow(url:string){
    const popupWidth = 400; // Width of the popup window
    const popupHeight = 200; // Height of the popup window
    const left = (window.screen.width / 2) - (popupWidth / 2);
    const top = (window.screen.height / 2) - (popupHeight / 2);

   const opendWindow = window.open(url,'popupWindow', `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=no,scrollbars=no`);

    if (opendWindow) {
      setTimeout(()=>{
        opendWindow.close();
      },2000);
    }
  
  }
}
