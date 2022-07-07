import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { HttpService } from 'src/app/services/http/http.service';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  animations: [
    trigger("slideInOut1", [
      transition(":enter", [
        style({ transform: "translateY(100%)" }),
        animate(
          "300ms ease-in",
          style({ transform: "translateY(0%)", opacity: "1" })
        ),
      ]),
      transition(":leave", [
        animate(
          "300ms ease-in",
          style({ transform: "translateY(100%)", opacity: "0" })
        ),
      ]),
    ]),
    trigger("slideInOut2", [
      transition(":enter", [
        style({ transform: "translateY(100%)" }),
        animate(
          "500ms ease-in",
          style({ transform: "translateY(0%)", opacity: "1" })
        ),
      ]),
      transition(":leave", [
        animate(
          "500ms ease-in",
          style({ transform: "translateY(100%)", opacity: "0" })
        ),
      ]),
    ]),
    trigger("slideInOut3", [
      transition(":enter", [
        style({ transform: "translateY(100%)" }),
        animate(
          "500ms ease-in",
          style({ transform: "translateY(0%)", opacity: "1" })
        ),
      ]),
      transition(":leave", [
        animate(
          "500ms ease-in",
          style({ transform: "translateY(100%)", opacity: "0" })
        ),
      ]),
    ]),
  ]
})
export class AssetsComponent implements OnInit {

  step = 1;
  isOnline = true;
  assetId: any;
  assetInfo: any = [];
  assetCheckList: any = [];
  assetDocuments: any = [];
  $subscription!: Subscription;
  params: any;

  constructor(
    private http: HttpService,
    private helper: HelperService,
    private offline: OfflineService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;

    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (isOnline) {
        this.getAssetInfo();
      }
    });
  }

  change(step: number) {
    this.step = step;
    if (this.isOnline) {
      step == 1 ? this.getAssetInfo() : '';
      step == 2 ? this.getAssetChecklist() : '';
      step == 3 ? this.getAssetDocuments() : '';
    }
  }
  getAssetInfo() {
    this.http.post(`AssetProperty/GetAssetProperties?AssetId=${+this.assetId}`, null).subscribe((res: any) => {
      this.assetInfo = res.data;
    })
  }
  getAssetChecklist() {
    this.http.post(`AssetChecklist/GetAssetChecklistsWithCategory?assetId=${+this.assetId}`, null).subscribe((res: any) => {      
      this.assetCheckList = res.data;
    })
  }
  getAssetDocuments() {
    this.http.get(`AssetDocument/GetAssetDocuments?AssetId=${+this.assetId}`).subscribe((res: any) => {
      this.assetDocuments = res.assetDocumentCategories;  
    })
  }

}
