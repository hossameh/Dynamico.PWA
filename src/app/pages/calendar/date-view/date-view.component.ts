import { ActivatedRoute, Params, Router } from '@angular/router';
import { dates, Planner, RecurringEvent } from './../../../core/interface/api.interface';
import { Component, OnInit, Input } from '@angular/core';
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
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';

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

  constructor(
    private router:Router
  ) { }

  ngOnInit(): void {

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
            id: this.plannerModel[i].formId,
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
  onEditClick(event: any) {
    const queryParams: Params = { editMode: false };

    this.router.navigate(['/page/checklist/'+event.id], {
      queryParams: queryParams,
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    } )
  }

}
