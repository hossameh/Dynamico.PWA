import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  items:any = []
  constructor(
    private http:HttpService
  ) { }

  ngOnInit(): void {
    this.getAll()
  }

  getAll(){
    this.http.get('Plans/GetUserChecklistsAssigned').subscribe((res) => {
      console.log('res',res);
      this.items = res;
    })
  }

}
