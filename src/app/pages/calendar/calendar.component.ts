import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  grade = false;
  constructor() { }

  ngOnInit(): void {
  }


  toggle(){
    this.grade = !this.grade
  }

}
