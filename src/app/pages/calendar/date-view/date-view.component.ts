import { ActivatedRoute, Params, Router } from '@angular/router';
import { dates, Planner, RecurringEvent } from './../../../core/interface/api.interface';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject, Subscription } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { Storage } from '@ionic/storage-angular';
import { AlertService } from 'src/app/services/alert/alert.service';
import { OfflineService } from 'src/app/services/offline/offline.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-date-view',
  templateUrl: './date-view.component.html',
  styleUrls: ['./date-view.component.scss']
})
export class DateViewComponent implements OnInit {
  @Input() items: Planner[] = [];
  @Output() showCompletedDateView = new EventEmitter();
  isChecked = false
  viewDate: Date = new Date();
  newEvent!: CalendarEvent;
  // view: string = 'month';
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent<any>[] = [];
  PlansEvent: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  refresh: Subject<any> = new Subject();
  actions: CalendarEventAction[] = [
    // {
    //   label: '<i class="fa fa-fw fa-pencil"></i>',
    //   onClick: ({ event }: { event: CalendarEvent; }): void => {

    //     this.onEditClick(event);
    //   }
    // },
    // {
    //   label: '<i class="fa fa-fw fa-times"></i>',
    //   onClick: ({ event }: { event: CalendarEvent; }): void => {

    //     this.onDeleteClick(event);

    //   }
    // }
  ];
  plannerModel!: any[];
  planner!: any;
  recurringEvents: RecurringEvent[] = [];
  Subscription!: Subscription;
  isOnline = true;
  userId: any;

  constructor(
    private router: Router,
    private storage: Storage,
    private alert: AlertService,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.Subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }
  toggle() {
    setTimeout(() => {
      this.showCompletedDateView.emit(this.isChecked);
    }, 50)
  }
  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    if (this.items.length > 0) {
      this.events = [];
      this.plannerModel = [];
      this.recurringEvents = [];

      this.plannerModel = <Planner[]>(this.items);
      for (let i = 0; i < this.plannerModel.length; i++) {
        let daysList = this.plannerModel[i].days.split(',');

        daysList.forEach((date: any) => {
          this.events.push({
            id: this.plannerModel[i].id,
            title: (this.plannerModel[i].title),
            color: { primary: this.plannerModel[i].color, secondary: '' },
            start: new Date(date),
            actions: this.actions,
            meta: date,
          });
        });
      }
      this.refresh.next();
      this.PlansEvent = this.events;
    }

  }

  resetPlannerModel() {
    this.planner = {
      endDate: null,
      startDate: null,
      companyId: 0,
      formId: 0,
      id: 0,
      userId: 0,
      usersId: [],
      isCreateFormData: false
    };
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[]; }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }
  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {

  }
  async onEditClick(event: any) {
    // console.log(event);

    let item = this.items.filter((el: any) => el.id == event.id)[0];
    if (item && item.isCreateFormData == true && item.plannerFormsData) {
      let formData = item.plannerFormsData.filter((el: any) =>
        new Date(el.day).getDay() == event.start.getDay()
      )[0];
      let complete = false;
      // if (this.access && this.access.toString().includes(this.accessTypes.Read)) {
      //   if (!this.access.includes(this.accessTypes.Update))
      complete = true;

      if (!this.isOnline) {
        // let cacheChecklists = await this.storage.get('Checklists') || [];
        // if (cacheChecklists) {
        //   console.log(cacheChecklists);
        //   console.log(item.formId);
          
        //   let valueChecklist = cacheChecklists.filter((el: any) => el.userId == this.userId && el.formId == item.formId)[0];
        //   console.log(valueChecklist);
          
        //   if (!valueChecklist) {
        //     this.alert.error("No Internet Connection");
        //     return;
        //   }
        // }
        let cacheRecords = await this.storage.get('Records') || [];
        if (cacheRecords) {
          let recordData = cacheRecords.filter((el: any) => el.userId == this.userId && el.record_Id == +formData.formsDataId)[0];
          let jsonData = recordData?.record ? recordData?.record : recordData?.record_Json;
          if (!recordData || !jsonData) {
            this.alert.error("No Internet Connection");
            return;
          }
        }
      }

      this.router.navigateByUrl("/page/checklist/" + item.formId + "?editMode=true" +
        // (complete == true ? "&Complete=true" : "") +
        "&offline=" + '' +
        "&listName=" + item.form.formTitle +
        "&Record_Id=" + +formData.formsDataId);
      // }
      // else {
      //   this.alert.error("You have No Access")
      //   return;
      // }
    }
    else {
      const queryParams: Params = { editMode: false };
      this.router.navigate(['/page/checklist/' + item.formId], {
        queryParams: queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      })
    }
  }

}
