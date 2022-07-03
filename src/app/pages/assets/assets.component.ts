import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { HttpService } from 'src/app/services/http/http.service';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
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
      step == 1 && this.assetInfo.length == 0 ? this.getAssetInfo() : '';
      step == 2 && this.assetCheckList.length == 0 ? this.getAssetChecklist() : '';
      step == 3 && this.assetDocuments.length == 0 ? this.getAssetDocuments() : '';
    }
  }
  getAssetInfo() {
    this.http.post(`AssetProperty/GetAssetProperties?AssetId=${+this.assetId}`, null).subscribe((res: any) => {
      this.assetInfo = res.Data
    })
  }
  getAssetChecklist() {
    this.http.post(`AssetChecklist/GetAssetChecklists?AssetId=${+this.assetId}`, null).subscribe((res: any) => {
      this.assetCheckList = res.Data
    })
  }
  getAssetDocuments() {
    this.http.get(`AssetDocument/GetAssetDocuments?AssetId=${+this.assetId}`).subscribe((res: any) => {
      this.assetDocuments = res.Data
    })
  }

}
