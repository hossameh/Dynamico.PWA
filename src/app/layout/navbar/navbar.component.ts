import { HelperService } from './../../services/helper.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  count = 0;
  constructor(
    private helper:HelperService
  ) { }

  ngOnInit(): void {
    this.helper.getingCount.subscribe((count) => {
      this.count = count
    })
  }

}
