import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  companyName: string = environment.companyName;
  userEmail: any;
  env = environment.ui;                         // <— expose env

  companyLogo: string = environment.companyLogoBlack;
  constructor() { }

  ngOnInit(): void {
  }

}
