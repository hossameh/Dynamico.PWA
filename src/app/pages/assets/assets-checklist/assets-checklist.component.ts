import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-assets-checklist',
  templateUrl: './assets-checklist.component.html',
  styleUrls: ['./assets-checklist.component.scss']
})
export class AssetsChecklistComponent implements OnInit {

  @Input() items: any = [];
  selectedItem: any = {}
  formRef = '';
  name!: '';

  constructor() { }

  ngOnInit(): void {
    console.log(this.items);
  }

}
