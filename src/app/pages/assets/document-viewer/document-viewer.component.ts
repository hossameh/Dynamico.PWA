import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocExtention, DocTypes } from 'src/app/core/enums/docType.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent implements OnInit {

  docTypes = DocTypes;
  doc: any;
  docExtensions: any[] = [];
  constructor(private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.docExtensions = Object.values(DocExtention)
      .map((el) => {
        return el.toLowerCase();
      });
    this.doc = this.route.snapshot.queryParams;
  }
  back(): void {
    this.location.back();
  };

}
