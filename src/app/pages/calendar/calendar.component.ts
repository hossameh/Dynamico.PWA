import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  grade = true;
  constructor(private http:HttpService) { }

  ngOnInit(): void {
    console.log('getPlans',this.getPlans());
  }


  toggle(){
    this.grade = !this.grade
  }

  getPlans(){
    this.http.get('Plans/GetPlans').subscribe(value => {
      console.log('value',value);
    })
  }

}
