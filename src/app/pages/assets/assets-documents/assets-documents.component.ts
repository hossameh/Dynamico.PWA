import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { DocExtention, DocTypes } from 'src/app/core/enums/docType.enum';
import { AlertService } from 'src/app/services/alert/alert.service';
import { OfflineService } from 'src/app/services/offline/offline.service';

@Component({
  selector: 'app-assets-documents',
  templateUrl: './assets-documents.component.html',
  styleUrls: ['./assets-documents.component.scss']
})
export class AssetsDocumentsComponent implements OnInit {

  @Input() items: any = [];
  isOnline = true;
  $subscription!: Subscription;
  docExtensions: any[] = [];
  constructor(private storage: Storage, private router: Router, private alert: AlertService,
    private offline: OfflineService,
  ) { }

  ngOnInit(): void {
    this.docExtensions = Object.values(DocExtention)
      .map((el) => {
        return el.toLowerCase();
      });
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }
  async viewDocument(item: any) {
    if (this.isOnline || !this.docExtensions.includes(item?.extension))
      this.router.navigateByUrl("/page/view-doc?id=" + item?.id + "&name=" + item?.documentName +
        "&mimeType=" + item?.mimeType + "&extension=" + item?.extension + "&documentPath=" + item?.documentPath);
    else {
      if (item?.canDownload == true) {
        let cashedDocuments = await this.storage.get("CashedDocuments") || [];
        let index = cashedDocuments.findIndex((el: any) => {
          return el.id == item?.id;
        });
        if (index >= 0) {
          let obj = cashedDocuments[index];
          let rawData = (<string>obj.documentPath).split("base64,");
          const binaryString = window.atob(<string>rawData[1]);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; ++i) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: obj?.mimeType });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          return;
        }
        else
          this.alert.error("No Internet Connection");
      }
      else
        this.alert.error("No Internet Connection");
    }
  }
  async setBack() {
    this.storage.set("BackToAssets", "Documents");
  }

}
