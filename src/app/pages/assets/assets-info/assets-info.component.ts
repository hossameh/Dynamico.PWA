import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { PropertyTypeEnum } from './propertiesType';

@Component({
  selector: 'app-assets-info',
  templateUrl: './assets-info.component.html',
  styleUrls: ['./assets-info.component.scss']
})
export class AssetsInfoComponent implements OnInit, OnChanges {

  @Input() items: any = [];
  elementType = NgxQrcodeElementTypes.URL;
  propertyTypeEnum = PropertyTypeEnum;
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.items)
      console.log(this.items);
  }

  ngOnInit(): void {
  }
  mapClick(value: any) {
    setTimeout(`window.location = 'geo:${value}';`, 1000);

    // window.location.href = "geo:" + value;
  }

}
