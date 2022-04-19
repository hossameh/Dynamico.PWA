import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  version = environment.version
  userData:any
  constructor() { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') || '{}')
  }

  logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
  }
}
