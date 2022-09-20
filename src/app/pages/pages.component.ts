import { Router, NavigationEnd } from '@angular/router';
import { routingAnimation } from 'src/app/router.animations';
import { Component, OnInit } from '@angular/core';
import { Role } from '../core/enums/role.enum';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  animations: [routingAnimation],
})
export class PagesComponent implements OnInit {
  hideMenu = false;
  role = Role;
  userRole!: string;

  constructor(private router: Router,) {
    router.events.subscribe((el: any) => {
      if (el as NavigationEnd) {
        this.hideMenu = el.url?.includes('page/visits')
          || this.userRole == this.role.Anonymous
          || el.url?.includes('home/pending/');
      } else {
        this.hideMenu = false;
      }
    });
  }

  ngOnInit(): void {
    this.userRole = JSON.parse(localStorage.getItem('userData') || '{}').userType;
  }

}
