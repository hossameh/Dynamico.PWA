import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormioCustomComponent, FormioEvent } from 'angular-formio';
import { maxSlotDuration, minSlotDuration } from './appointmentEditForm';

const now = new Date();

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements FormioCustomComponent<string>, OnInit, OnChanges {
  @Input()
  value!: string;

  // the default event emit value to formio
  @Output()
  valueChange = new EventEmitter<string>();

  @Input()
  disabled!: boolean;

  @Input()
  slotDuration: any;

  @Input()
  customSlotDuration!: number;

  @Input()
  intervals!: any[];

  @Input()
  lunchTime!: boolean;

  @Input()
  lunchTimeFrom!: string;

  @Input()
  lunchTimeTo!: string;

  @Input()
  startDate!: string;// 

  limitStart: NgbDateStruct = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

  @Input()
  endDate!: string;// = { month: 6, year: 2023, day: 27 };

  limitEnd!: NgbDateStruct |any;

  @Input()
  displayedValue = '';

  @Input()
  vacations!: any[];

  @Input()
  popupView!: boolean;

  vacationDaysList: NgbDateStruct[] = [];
  selectDate: NgbDateStruct |any= { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  slotDurationList: any[] = [];
  openDate: { year: number, month: number } = { year: now.getFullYear(), month: now.getMonth() + 1 };

  firstDayOfWeek: number = 7; // sunday;
  constructor(private calendar: NgbCalendar) {

  }
  ngOnChanges(changes: SimpleChanges): void {

    if (changes.slotDuration && changes.slotDuration.currentValue && changes.customSlotDuration && changes.customSlotDuration.currentValue) {
      if (changes.slotDuration.currentValue === "custom")
        this.slotDuration = changes.customSlotDuration.currentValue;
    }
    if (changes.intervals && changes.intervals.currentValue && changes.intervals.currentValue.length > 0) {
      if (this.slotDuration
        && typeof (this.slotDuration) === "number"
        && this.slotDuration > minSlotDuration
        && this.slotDuration < maxSlotDuration) {
        this.updateSlotDurations();
      }
    }
    if (this.startDate || this.endDate) {
      this.updateLimits();
    }
    if (this.vacations && this.vacations.length > 0) {
      this.updateVacationDays();
    }

    if (this.value) {
      this.updateDisplayedValue();
    }


  }
  formioEvent?: EventEmitter<FormioEvent>;

  ngOnInit(): void {

  }

  updateSlotDurations() {
    try {
      if (this.intervals
        && this.intervals.length > 0
        && this.slotDuration
        && typeof (this.slotDuration) === "number"
        && this.slotDuration > minSlotDuration
        && this.slotDuration < maxSlotDuration
        && this.selectDate) {
        const currentDate: NgbDate|any = NgbDate.from(this.selectDate);
        const seletedDateAsString = this.getDateAsString(this.selectDate);
        const currentDayWeekIndex = this.calendar.getWeekday(currentDate); // return dayIndex per Week Mon =1 ... Sun =7
        this.slotDurationList = [];
        const slotDurationPerMiliSecond = this.slotDuration * 60 * 1000;

        // sort inner interval asc by intervalFrom
        this.intervals.forEach((item) => {
          item.timeIntervals.sort(this.sortInnerIntervals);
        });
        // sort main interval by start from smaller interfrom
        this.intervals.sort(this.sortMainIntervals);

        for (let i = 0; i < this.intervals.length; i++) {
          const interval = this.intervals[i];
          if (interval.weekDays.includes(currentDayWeekIndex)) // day exist in list of days per week
          {
            if (interval.timeIntervals && interval.timeIntervals.length > 0) // inner intervals
            {
              const sortedInnerIntervals = interval.timeIntervals.sort(this.sortInnerIntervals);

              for (let j = 0; j < sortedInnerIntervals.length; j++) {
                const innerInterval = sortedInnerIntervals[j];
                const startTime = new Date(`${seletedDateAsString}T${innerInterval.intervalFrom}`);
                const endTime = new Date(`${seletedDateAsString}T${innerInterval.intervalTo}`);

                // chenk if end > start and def between them > slot time 
                if (endTime > startTime && (endTime.getTime() - startTime.getTime() >= slotDurationPerMiliSecond)) {
                  const diffInMilliseconds = endTime.getTime() - startTime.getTime();
                  const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
                  const numberOfAppiontPerInterval = Math.floor(diffInMinutes / this.slotDuration);
                  for (let k = 0; k < numberOfAppiontPerInterval; k++) {
                    const slotStartTimeDate = new Date(startTime.getTime() + (k * slotDurationPerMiliSecond));
                    const slot: any = {
                      slotDate: slotStartTimeDate,
                      h12: slotStartTimeDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true

                      }).replace(/^00/, '12')
                        .replace(/^ 0(\d +) /, ' $1')
                        .replace(/(\b[ap]m\b)/i, (match) => match.toUpperCase()),
                      h24: slotStartTimeDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }),
                      selected: false,
                      slotEndDate: new Date(slotStartTimeDate.getTime() + slotDurationPerMiliSecond)
                    };

                    if (this.lunchTime && this.lunchTimeFrom && this.lunchTimeTo) {
                      const lunchTimeFromDate = new Date(`${seletedDateAsString}T${this.lunchTimeFrom}`);
                      const lunchTimeToDate = new Date(`${seletedDateAsString}T${this.lunchTimeTo}`);
                      const slotEndTimeDate = new Date(slot.slotDate.getTime() + slotDurationPerMiliSecond);

                      if ((lunchTimeToDate > lunchTimeFromDate) &&
                        (slot.slotDate < lunchTimeToDate && slotEndTimeDate > lunchTimeFromDate) ||
                        (slot.slotDate <= lunchTimeFromDate && slotEndTimeDate >= lunchTimeToDate) ||
                        (slot.slotDate < lunchTimeFromDate && slotEndTimeDate < lunchTimeToDate && slotEndTimeDate > lunchTimeFromDate) ||
                        (slot.slotDate > lunchTimeFromDate && slot.slotDate < lunchTimeToDate && slotEndTimeDate > lunchTimeToDate)
                      ) {

                        if (slotEndTimeDate > lunchTimeToDate) // end duration shared
                        {

                          // replace start of slot to be end of lunch time .
                          slot.slotDate = new Date(lunchTimeToDate.getTime());
                          slot.h12 = slot.slotDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          }).replace(/^00/, '12')
                            .replace(/^ 0(\d +) /, ' $1')
                            .replace(/(\b[ap]m\b)/i, (match:any) => match.toUpperCase());
                          slot.h24 = slot.slotDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          });
                          slot.slotEndDate = new Date(slot.slotDate.getTime() + slotDurationPerMiliSecond);
                        }
                        else {
                          continue;
                        }

                      }

                    }

                    // check for shared time between intervals
                    const lastSlot = this.slotDurationList.length > 0 ? this.slotDurationList[this.slotDurationList.length - 1] : null;
                    if (lastSlot) {
                      const firstAvailableSlot = new Date(lastSlot.slotDate.getTime() + slotDurationPerMiliSecond);
                      if (firstAvailableSlot > slot.slotDate)
                        continue;
                    }
                    this.slotDurationList.push(slot);


                  }

                }

              }

            }

          }
        }




      }
    }
    catch (err) {
    }
  }

  onSlotSelected(slot:any, event:any) {
    if (this.slotDurationList && this.slotDurationList.length > 0) {
      this.slotDurationList.forEach((slot) => slot.selected = false);
      slot.selected = true;
      this.value = `${this.getDateAsString(this.selectDate)}T${slot.h24}`;
      const dayName = new Date(this.getDateAsString(this.selectDate)).toLocaleString('en-US', { weekday: 'long' });
      const fullDate = new Date(this.getDateAsString(this.selectDate)).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      this.displayedValue = `You've selected ${slot.h12} On ${dayName},${fullDate}`;
      this.valueChange.emit(this.value);
    }
  }

  onDateChanged() {
    this.value = this.displayedValue = '';
    this.valueChange.emit(this.value);
    this.updateSlotDurations();
  }
  getDateAsString(date: NgbDateStruct) {
    if (!date)
      return '';

    return date.year + "-" + ('0' + date.month).slice(-2)
      + "-" + ('0' + date.day).slice(-2);

  }

  getDateAsStuct(date: string): NgbDateStruct | null {

    if (!date)
      return null;

    const parts = date.split('-');
    const normalDate = { year: +parts[0], month: +parts[1], day: +parts[2].slice(0, 2) }

    return normalDate;

  }

  isDayDisabled(date: NgbDateStruct | any, current: { year: number; month: number } |any): boolean {
    if (date.year === current.year && current.month === date.month) {
      if (this.vacationDaysList.length === 0)
        return false;
      else {
        return this.vacationDaysList.filter((item) => equals(item, date)).length > 0
      }
    }
    else
      return false;

  }

  sortInnerIntervals(a:any, b:any) {
    const timeA = new Date(`2000-01-01T${a.intervalFrom}`);
    const timeB = new Date(`2000-01-01T${b.intervalFrom}`);
    if (timeA < timeB) {
      return -1;
    }
    if (timeA > timeB) {
      return 1;
    }
    return 0;
  }

  sortMainIntervals(a:any, b:any) {
    const minA = new Date(`2000-01-01T${a.timeIntervals[0].intervalFrom}`);
    const minB = new Date(`2000-01-01T${b.timeIntervals[0].intervalFrom}`);
    if (minA < minB) {
      return -1;
    }
    if (minA > minB) {
      return 1;
    }
    return 0;
  }

  getDiffInMintues(start: Date, end: Date) {
    if (end > start) {
      const diffInMilliseconds = end.getTime() - start.getTime();
      return Math.floor(diffInMilliseconds / 1000 / 60);
    }
    else {
      return 0;
    }

  }

  updateLimits() {
    if (this.startDate && this.limitStart) {
      const userStartDate:any= this.getDateAsStuct(this.startDate);

      if (before(userStartDate, this.limitStart)) {
        this.limitStart = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
      }
      else {
        this.limitStart = this.selectDate = userStartDate;

      }
    }

    if (this.endDate && this.limitStart) {
      const userEndDate:any = this.getDateAsStuct(this.endDate);
      if (after(userEndDate, this.limitStart)) {
        this.limitEnd = userEndDate;
      }
      else {
        this.limitEnd = null;
      }
    }



  }

  updateVacationDays() {
    this.vacationDaysList = [];
    this.vacations.forEach((vacation) => {
      if (vacation.vacationStartDate && vacation.vacationEndDate) {
        const fromDate = new Date(vacation.vacationStartDate);
        const toDate = new Date(vacation.vacationEndDate);
        if (toDate >= fromDate) {

          for (let date = fromDate; date <= toDate; date.setDate(date.getDate() + 1)) {

            const vactionDay: NgbDateStruct = {
              year: date.getFullYear(),
              month: +String(date.getMonth() + 1).padStart(2, '0'),
              day: +String(date.getDate()).padStart(2, '0')
            };

            const existBefore = this.vacationDaysList.filter((item) => equals(item, vactionDay));

            if (existBefore.length === 0)
              this.vacationDaysList.push(vactionDay);


          }
        }
      }
    });
  }

  updateDisplayedValue() {


    if (this.value) {
      const selectedDateTime = new Date(this.value);
      const selectedH12 = selectedDateTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/^00/, '12')
        .replace(/^ 0(\d +) /, ' $1')
        .replace(/(\b[ap]m\b)/i, (match) => match.toUpperCase());

      const selectedDateParts = this.value.split('T');
      // update selected Date
      if (selectedDateParts && selectedDateParts.length > 1) {
        this.selectDate = this.getDateAsStuct(selectedDateParts[0]);

        // update limit to be selected date in case selected date before limit
        if (this.selectDate && before(this.selectDate, this.limitStart)) {
          this.limitStart = this.selectDate;
        }

        // update open date to make calendar open in same month and year selected
        this.openDate = { year: this.selectDate.year, month: this.selectDate.month };

      }

      //update displayed value

      const dayName = new Date(selectedDateParts[0]).toLocaleString('en-US', { weekday: 'long' });
      const fullDate = new Date(selectedDateParts[0]).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      this.displayedValue = `You've selected ${selectedH12} On ${dayName},${fullDate}`;

      // make selected  slot  based on slort 24 time

      if (this.slotDurationList && this.slotDurationList.length > 0) {
        const selectedSlot = this.slotDurationList.filter((item) => item.h24 === selectedDateParts[1]);
        if (this.selectDate && selectedSlot && selectedSlot.length > 0) {
          selectedSlot[0].selected = true;

        }
      }



    }
  }

  addTimeZoneOffset(dateString:any, timeZoneOffset:any) {
    const date = new Date(dateString);

    const timeZoneOffsetInMinutes = timeZoneOffset * 60;
    const sign = timeZoneOffsetInMinutes >= 0 ? '+' : '-';
    const offsetHours = Math.abs(Math.floor(timeZoneOffsetInMinutes / 60));
    const offsetMinutes = Math.abs(timeZoneOffsetInMinutes % 60);
    const timeZoneOffsetString = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;
    const dateWithTimeZone = `${date.toISOString().replace('Z', '')}${timeZoneOffsetString}`;

    return dateWithTimeZone;
  }

}
