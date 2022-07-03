import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-assets-info',
  templateUrl: './assets-info.component.html',
  styleUrls: ['./assets-info.component.scss']
})
export class AssetsInfoComponent implements OnInit {

  @Input() items: any = [];

  constructor() { }

  ngOnInit(): void {
    console.log(this.items);
    
  }

}
