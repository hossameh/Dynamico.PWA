import { Component, Input, OnInit } from '@angular/core';
import { DocTypes } from 'src/app/core/enums/docType.enum';

@Component({
  selector: 'app-assets-documents',
  templateUrl: './assets-documents.component.html',
  styleUrls: ['./assets-documents.component.scss']
})
export class AssetsDocumentsComponent implements OnInit {

  @Input() items: any = [];
  constructor() { }

  ngOnInit(): void {
  }

}
