import { Injectable } from '@angular/core';
import { Formio } from 'angular-formio';
@Injectable({
  providedIn: 'root'
})
export class FormioConfigService {
  interceptPlugin: any = {
    priority: 0,
    preRequest: this.replaceToken.bind(this)
  }
  constructor() {

  }

  interceptFormioRequests() {
    Formio.registerPlugin(this.interceptPlugin, 'preReq');
  }
  replaceToken(requestArgs: any) {
    if (requestArgs.opts) {
      let token = JSON.parse(localStorage.getItem('token') || '{}');
      requestArgs.opts.header.map['authorization'] = `Bearer ${token}`;
      return requestArgs;
    }

  }
}
