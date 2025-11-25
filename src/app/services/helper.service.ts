import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http/http.service';
import { ContainerControlTypesEnum, ControlTypeEnum, labeledTypes } from '../core/enums/role.enum';
import { environment } from '../../environments/environment';
import { HttpBackend, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  formioI18n: any;
  formioLocURL = environment.formioI18n;

  currentLang: BehaviorSubject<string> = new BehaviorSubject('ar');
  checklistData: BehaviorSubject<any> = new BehaviorSubject(null);
  getingCount: BehaviorSubject<any> = new BehaviorSubject(null);
  getingNotificationCount: BehaviorSubject<any> = new BehaviorSubject(null);

  isOnline = true;
  userId: any;

  constructor(
    private http: HttpService,
    private storage: Storage,
    private translate: TranslateService, private httpBackend: HttpBackend
  ) {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.getFormIOI18Data();

  }
  getFormIOI18Data() {
    try {
      const rawHttp = new HttpClient(this.httpBackend); // no interceptors
      rawHttp.get('assets/data/formioI18n.json')
        .subscribe((data: any) => {
          this.formioI18n = data;
        });
    }
    catch (e) {
    }
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
  getPrimitiveComponents(component: any, considerButton: boolean = false): any[] {
    let primControls :any = [];
    switch (component?.type) {
      case ContainerControlTypesEnum.columns:
        component?.columns?.forEach((column:any) => {
          column.components?.forEach((comp:any) => {
            if (Object.keys(ControlTypeEnum).includes(comp?.type) || (considerButton && comp.type == labeledTypes.button))
              primControls.push(comp);
            else {
              const firstChildsCompoenent = this.getPrimitiveComponents(comp, considerButton);
              if (firstChildsCompoenent?.length > 0)
                primControls = [...primControls, ...firstChildsCompoenent];
            }
          });

        });
        break;
      case ContainerControlTypesEnum.table:
        component?.rows?.forEach((row:any) => {
          row?.forEach((rowItem:any) => {
            rowItem?.components?.forEach((comp:any) => {
              if (Object.keys(ControlTypeEnum).includes(comp.type) || (considerButton && comp.type == labeledTypes.button))
                primControls.push(comp);
              else {
                const primitiveChilds = this.getPrimitiveComponents(comp, considerButton);
                if (primitiveChilds?.length > 0)
                  primControls = [...primControls, ...primitiveChilds]
              }
            });
          });
        });
        break;
      case ContainerControlTypesEnum.well:
        component?.components?.forEach((comp:any) => {
          if (Object.keys(ControlTypeEnum).includes(comp.type) || (considerButton && comp.type == labeledTypes.button))
            primControls.push(comp);
          else {
            const primitiveChilds = this.getPrimitiveComponents(comp, considerButton);
            if (primitiveChilds?.length > 0)
              primControls = [...primControls, ...primitiveChilds]
          }
        });
        break;
      case ContainerControlTypesEnum.tabs:
        component?.components?.forEach((comp:any) => {
          comp?.components?.forEach((innerComponent:any) => {

            if (Object.keys(ControlTypeEnum).includes(innerComponent.type) || (considerButton && comp.type == labeledTypes.button))
              primControls.push(innerComponent);
            else {
              const primitiveChilds = this.getPrimitiveComponents(innerComponent, considerButton);
              if (primitiveChilds?.length > 0)
                primControls = [...primControls, ...primitiveChilds]
            }

          });

        });
        break;
      case ContainerControlTypesEnum.panel:
        component?.components?.forEach((comp:any) => {
          if (Object.keys(ControlTypeEnum).includes(comp.type) || (considerButton && comp.type == labeledTypes.button))
            primControls.push(comp);
          else {
            const primitiveChilds = this.getPrimitiveComponents(comp, considerButton);
            if (primitiveChilds?.length > 0)
              primControls = [...primControls, ...primitiveChilds]
          }

        });
        break;
      case ContainerControlTypesEnum.fieldset:
        component?.components?.forEach((comp:any) => {

          if (Object.keys(ControlTypeEnum).includes(comp.type) || (considerButton && comp.type == labeledTypes.button))
            primControls.push(comp);
          else {
            const primitiveChilds = this.getPrimitiveComponents(comp, considerButton);
            if (primitiveChilds?.length > 0)
              primControls = [...primControls, ...primitiveChilds]
          }

        });
        break;
    }
    return primControls;
  }

  adaptFormIoDateTimeValue(serializedData: any[], allComponents: any[]): any[] {
    try {
      if (allComponents && serializedData) {
        let primitiveControls = allComponents.filter((item) => { return Object.keys(ControlTypeEnum).includes(item.type); });

        allComponents.forEach((item) => {
          if (Object.keys(ContainerControlTypesEnum).includes(item.type)) {
            const primControls = this.getPrimitiveComponents(item);
            primitiveControls = [...primitiveControls, ...primControls]
          }
        });

        const dateAndDataGridControls = primitiveControls.filter((item) => (item.type === ControlTypeEnum.datetime));
        if (dateAndDataGridControls?.length > 0) {

          serializedData.forEach((controlValue) => {

            const controlItem = dateAndDataGridControls.filter(x => x.key === controlValue.name)[0];

            if (controlItem && controlItem.type === ControlTypeEnum.datetime) {
              if (controlValue.value) {
                let adjustedDateValue = this.ajustDate(controlValue.value);
                // check for time if not enbale remobe it
                adjustedDateValue = controlItem.enableTime ? adjustedDateValue : adjustedDateValue.split('T')[0];
                controlValue.value = adjustedDateValue;

              }
            }


          });



          return serializedData;
        }
        else {
          return serializedData;
        }



      }
      else {
        return serializedData;
      }

    }
    catch (ex) {
      return serializedData;
    }

  }
  ajustDate(input: string | Date): string {
    try {
      if (!input) return '';

      // If input is a Date object
      if (input instanceof Date) {
        // Just return the local datetime as string, without milliseconds or 'Z'
        const year = input.getFullYear();
        const month = String(input.getMonth() + 1).padStart(2, '0');
        const day = String(input.getDate()).padStart(2, '0');
        const hours = String(input.getHours()).padStart(2, '0');
        const minutes = String(input.getMinutes()).padStart(2, '0');
        const seconds = String(input.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }

      // If input is a string, strip timezone like +03:00, -02:00 or Z
      return input.replace(/\.\d{3}/, '').replace(/([+-]\d{2}:\d{2}|Z)$/, '');
    }
    catch (ex) {
      return input as string;
    }

  }
}
