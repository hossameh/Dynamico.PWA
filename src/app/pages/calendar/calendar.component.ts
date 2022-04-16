import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  grade = true;
  items = []
  constructor(private http:HttpService) { }

  ngOnInit(): void {
    console.log('getPlans',this.getPlans());
  }


  toggle(){
    this.grade = !this.grade
  }

  getPlans(){
    let body = {
      pageIndex: 1,
      pageSize:2,
      // UserId:JSON.parse(localStorage.getItem('userData') || '{}').userId
    }
    this.http.get('Plan/GetPlans',body).subscribe((value:any) => {
      this.items = value.list
      console.log('value',value);
    })
  }

}
