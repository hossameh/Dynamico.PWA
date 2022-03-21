import { Router, NavigationEnd } from '@angular/router';
import { routingAnimation } from 'src/app/router.animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  animations: [routingAnimation],
})
export class PagesComponent implements OnInit {
  hideMenu  = false;

  constructor(private router:Router,) {
    router.events.subscribe((el:any) => {
      if(el as NavigationEnd){
        this.hideMenu = el.url?.includes('page/visits') ||  el.url?.includes('home/pending/');
      }else{
        this.hideMenu = false;
      }
    } );
  }

  ngOnInit(): void {
  }

}
