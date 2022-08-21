import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss']
})
export class NotificationDetailsComponent implements OnInit {

  id!: number;
  title: any;
  body: any;
  showAll: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    let params = this.route.snapshot.queryParams;
    this.title = params?.title;
    this.body = params?.body;
    this.showAll = params?.showAll;
  }

  back(): void {
    this.showAll ?
      this.router.navigateByUrl("/page/notification?showAll=" + this.showAll) :
      this.location.back();
  };

}
