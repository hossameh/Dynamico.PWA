import { Subscription } from 'rxjs';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  grade = true;
  items = [];
  itemsDateView = [];
  Subscription!: Subscription;
  isOnline = true;

  constructor(private http: HttpService,
    private offline: OfflineService,
    private storage: Storage,
  ) { }

  ngOnInit(): void {
    this.Subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      // if (isOnline) {
      //   this.toggle();
      // }
    });
    this.toggle();
  }


  toggle() {
    this.grade = !this.grade;
    if (this.grade) {
      this.getPlans();
    } else {
      this.getPlansForDateView();
    }
  }

  async getPlans(isComplete: any = null) {
    let cashedListPlans = await this.storage.get("ListPlans") || [];
    if (this.isOnline) {
      let body: any = {};
      body.pageIndex = 1;
      body.pageSize = 10;
      body.UserId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
      if (isComplete)
        body.ShowCompletedForms = isComplete;
      this.http.get('Plans/MobileGetPlans', body).subscribe(async (value: any) => {
        this.items = value.list;
        cashedListPlans = this.items;
        await this.storage.set("ListPlans", cashedListPlans);
      });
    }
    else
      this.items = cashedListPlans;
  }

  showCompleted(event: boolean) {
    this.getPlans(event)
  }
  showCompletedDateView(event: boolean) {
    this.getPlansForDateView(event)
  }
  async getPlansForDateView(isComplete: any = false) {
    let cashedDateViewPlans = await this.storage.get("DateViewPlans") || [];
    if (this.isOnline) {
      let body = {
        ShowCompletedForms: isComplete,
        UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId
      };
      this.http.get('Plans/GetPlans', body).subscribe(async (value: any) => {
        this.itemsDateView = value.list;
        cashedDateViewPlans = this.itemsDateView;
        await this.storage.set("DateViewPlans", cashedDateViewPlans);
      });
    }
    else
      this.itemsDateView = cashedDateViewPlans;
  }
}
