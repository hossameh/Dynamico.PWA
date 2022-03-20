import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit {
  items = [1,1,1,1,1,1]

  constructor() { }

  ngOnInit(): void {
  }

}
