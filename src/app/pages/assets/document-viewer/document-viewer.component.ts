import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocTypes } from 'src/app/core/enums/docType.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent implements OnInit {

  docTypes = DocTypes;
  doc: any;
  constructor(private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.doc = this.route.snapshot.queryParams;
    console.log(this.doc);

  }
  back(): void {
    this.location.back();
  };

}
