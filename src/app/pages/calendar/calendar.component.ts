import { Subscription } from 'rxjs';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

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
  userId: any;

  constructor(private http: HttpService,
    private offline: OfflineService,
    private storage: Storage,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.Subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      // if (isOnline) {
      //   this.toggle();
      // }
    });
    this.toggle();
  }


  async toggle() {
    let goToList = await this.storage.get("BackToPlan") || null;
    if (goToList) {
      this.grade = false;
      await this.storage.remove("BackToPlan");
    }
    this.grade = !this.grade;
    if (this.grade) {
      this.getPlans();
    } else {
      this.getPlansForDateView();
    }
  }

  async getPlans(isComplete: any = null) {
    let cashedListPlans = await this.storage.get("ListPlans") || [];
    let userCashedListPlans = cashedListPlans.filter((el: any) => el.userId == this.userId);
    cashedListPlans = cashedListPlans.filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body: any = {};
      body.pageIndex = 1;
      body.pageSize = 10;
      body.UserId = this.userId;
      if (isComplete)
        body.ShowCompletedForms = isComplete;
      this.http.get('Plans/MobileGetPlans', body).subscribe(async (value: any) => {
        this.items = value.list;
        this.items.map((el: any) => {
          el.userId = this.userId;
          cashedListPlans.push(el);
        });
        await this.storage.set("ListPlans", cashedListPlans);
      });
    }
    else
      this.items = userCashedListPlans;
  }

  showCompleted(event: boolean) {
    this.getPlans(event)
  }
  showCompletedDateView(event: boolean) {
    this.getPlansForDateView(event)
  }
  async getPlansForDateView(isComplete: any = false) {
    let cashedDateViewPlans = await this.storage.get("DateViewPlans") || [];
    let userCashedDateViewPlans = cashedDateViewPlans.filter((el: any) => el.userId == this.userId);
    cashedDateViewPlans = cashedDateViewPlans.filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body = {
        ShowCompletedForms: isComplete,
        UserId: this.userId
      };
      this.http.get('Plans/GetPlans', body).subscribe(async (value: any) => {
        this.itemsDateView = value.list;
        this.itemsDateView.map((el: any) => {
          el.userId = this.userId;
          cashedDateViewPlans.push(el);
        });
        await this.storage.set("DateViewPlans", cashedDateViewPlans);
      });
    }
    else
      this.itemsDateView = userCashedDateViewPlans;
  }
}
