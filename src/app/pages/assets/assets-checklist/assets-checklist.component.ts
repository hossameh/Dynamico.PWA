import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-assets-checklist',
  templateUrl: './assets-checklist.component.html',
  styleUrls: ['./assets-checklist.component.scss']
})
export class AssetsChecklistComponent implements OnInit {

  @Input() items: any = [];

  constructor() { }

  ngOnInit(): void {
    console.log(this.items);
  }

}
