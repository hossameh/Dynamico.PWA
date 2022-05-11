import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  currentLang: BehaviorSubject<string>  = new BehaviorSubject('ar');
  checklistData: BehaviorSubject<any>  = new BehaviorSubject(null);
  getingCount: BehaviorSubject<any>  = new BehaviorSubject(null);
  getingNotificationCount: BehaviorSubject<any>  = new BehaviorSubject(null);

  constructor( ) { }

}
