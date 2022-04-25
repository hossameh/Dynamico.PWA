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

  constructor(private http: HttpService,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.Subscription = this.offline.currentStatus.subscribe(isOnline => {
      if (isOnline) {
        this.toggle();
      }
    });
  }


  toggle() {
    this.grade = !this.grade;
    if (this.grade) {
      this.getPlans();
    } else {
      this.getPlansForDateView();
    }
  }

  getPlans(isComplete:any = null) {
    let body = {
      pageIndex: 1,
      pageSize: 10,
      UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId,
      ShowCompletedForms:isComplete
    };
    this.http.get('Plan/GetPlans', body).subscribe((value: any) => {
      this.items = value.list;
    });
  }

  showCompleted(event: boolean) {
    this.getPlans(event)
  }
  showCompletedDateView(event: boolean) {
    this.getPlansForDateView(event)
  }
  getPlansForDateView(isComplete:any = false) {
    let body = {
      ShowCompletedForms:isComplete,
      UserId: JSON.parse(localStorage.getItem('userData') || '{}').userId
    };
    this.http.get('Plans/GetPlans', body).subscribe((value: any) => {
      this.itemsDateView = value.list;
    });
  }
}
