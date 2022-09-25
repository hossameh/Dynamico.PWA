import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocExtention, DocTypes } from 'src/app/core/enums/docType.enum';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Storage } from '@ionic/storage-angular';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent implements OnInit {

  docTypes = DocTypes;
  params: any;
  doc: any;
  docDataAsString!: string;
  docExtensions: any[] = [];
  isOnline = true;
  $subscription!: Subscription;

  constructor(private route: ActivatedRoute,
    private location: Location,
    private http: HttpClient,
    private offline: OfflineService,
    private storage: Storage,
    private alert: AlertService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.docExtensions = Object.values(DocExtention)
      .map((el) => {
        return el.toLowerCase();
      });
    this.params = this.route.snapshot.queryParams;
    // console.log(this.params);
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      this.setDocumentObj();
    });
  }
  async setDocumentObj() {
    if (this.isOnline) {
      this.doc = this.params;
      await this.getDocDataAsString();
    }
    else {
      let cashedDocuments = await this.storage.get("CashedDocuments") || [];
      let index = cashedDocuments.findIndex((el: any) => {
        return el.id == this.params?.id;
      });
      if (index >= 0) {
        let obj = cashedDocuments[index];
        this.doc = {
          id: obj?.id,
          extension: obj?.extension,
          mimeType: obj?.mimeType,
          name: obj?.name,
          onlinePath: obj?.onlinePath,
          documentPath: <string>this.sanitizer.bypassSecurityTrustResourceUrl(obj.documentPath)
        };
      }
      else
        this.alert.error("No Internet Connection");
      // console.log(this.doc);

    }
  }
  back(): void {
    this.location.back();
  };
  async getDocDataAsString() {
    try {
      let cashedDocuments = await this.storage.get("CashedDocuments") || [];
      let index = cashedDocuments.findIndex((el: any) => {
        return el.id == this.params?.id;
      });
      this.getDocByURL(this.doc.documentPath).subscribe((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async () => {
          let imageData = reader.result;
          let imageDataAsString = <string>imageData;
          this.docDataAsString = imageDataAsString;

          if (index >= 0) {
            cashedDocuments[index].documentPath = this.docDataAsString;
          }
          else {
            let obj = {
              documentPath: this.docDataAsString,
              onlinePath: this.params?.documentPath,
              extension: this.params?.extension,
              id: this.params?.id,
              mimeType: this.params?.mimeType,
              name: this.params?.name
            }
            cashedDocuments.push(obj);
          }
          await this.storage.set("CashedDocuments", cashedDocuments);
        };
        reader.onerror = (event: any) => {
          console.log("File could not be read: " + event?.target?.error?.code);
        };
      });
    }
    catch (err) {
      console.log(err);
    }
  }
  getDocByURL(url: any) {
    return this.http.get(url, { responseType: 'blob' });
  }

}
