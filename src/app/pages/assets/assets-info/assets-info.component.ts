import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { PropertyTypeEnum } from './propertiesType';

@Component({
  selector: 'app-assets-info',
  templateUrl: './assets-info.component.html',
  styleUrls: ['./assets-info.component.scss']
})
export class AssetsInfoComponent implements OnInit {

  @Input() items: any = [];
  elementType = NgxQrcodeElementTypes.URL;
  propertyTypeEnum = PropertyTypeEnum;
  constructor() { }

  ngOnInit(): void {
  }
  mapClick(value: any) {
    window.open("http://maps.google.com/maps/search/" + value, "_blank")
    //  window.location.href = "http://maps.google.com/maps/search/" + value;
  }

}
