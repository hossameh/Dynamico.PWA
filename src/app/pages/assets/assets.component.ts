import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { HttpService } from 'src/app/services/http/http.service';
import { OfflineService } from 'src/app/services/offline/offline.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { Storage } from '@ionic/storage-angular';

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
  userId: any;

  constructor(
    private http: HttpService,
    private helper: HelperService,
    private offline: OfflineService,
    private route: ActivatedRoute,
    private storage: Storage
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;

    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      // if (isOnline) {
      this.getAssetInfo();
      // }
    });
  }

  change(step: number) {
    this.step = step;
    // if (this.isOnline) {
    step == 1 ? this.getAssetInfo() : '';
    step == 2 ? this.getAssetChecklist() : '';
    step == 3 ? this.getAssetDocuments() : '';
    // }
  }
  async getAssetInfo() {
    if (this.isOnline)
      this.http.post(`AssetProperty/GetAssetProperties?AssetId=${+this.assetId}`, null).subscribe(async (res: any) => {
        this.assetInfo = res.data;
        await this.saveAssetInfoInDb();
      })
    else
      await this.getAssetInfoFromDb();
  }
  async getAssetChecklist() {
    if (this.isOnline)
      this.http.post(`AssetChecklist/GetAssetChecklistsWithCategory?assetId=${+this.assetId}`, null).subscribe(async (res: any) => {
        this.assetCheckList = res.data;
        await this.saveAssetChecklistInDb();
      })
    else
      await this.getAssetChecklistFromDb();
  }
  async getAssetDocuments() {
    if (this.isOnline)
      this.http.get(`AssetDocument/GetAssetDocuments?AssetId=${+this.assetId}`).subscribe(async (res: any) => {
        this.assetDocuments = res.assetDocumentCategories;
        await this.saveAssetDocumentsInDb();
      })
    else
      await this.getAssetDocumentsFromDb();
  }
  async saveAssetInfoInDb() {
    let cashedAssetsInfo = await this.storage.get('AssetsInfo') || [];
    this.assetInfo.map((el: any) => { el.userId = this.userId });
    if (cashedAssetsInfo) {
      // check if Category  id is in cahce
      let infoList = cashedAssetsInfo.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
      //remove old info
      cashedAssetsInfo = cashedAssetsInfo.filter((el: any) => !infoList.includes(el));
      //push new list
      cashedAssetsInfo.push(...this.assetInfo);
    } else {
      cashedAssetsInfo.push(...this.assetInfo);
    }
    await this.storage.set('AssetsInfo', cashedAssetsInfo);
  }
  async getAssetInfoFromDb() {
    let cashedAssetsInfo = await this.storage.get('AssetsInfo') || [];
    if (cashedAssetsInfo)
      this.assetInfo = cashedAssetsInfo.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
  }
  async saveAssetChecklistInDb() {
    this.assetCheckList.map((el: any) => {
      el.assetId = + this.assetId,
        el.userId = this.userId
    })
    let cashedAssetsChecklist = await this.storage.get('AssetsChecklist') || [];
    if (cashedAssetsChecklist) {
      // check if Category  id is in cahce
      let oldList = cashedAssetsChecklist.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
      //remove old info
      cashedAssetsChecklist = cashedAssetsChecklist.filter((el: any) => !oldList.includes(el));
      //push new list
      cashedAssetsChecklist.push(...this.assetCheckList);
    } else {
      cashedAssetsChecklist.push(...this.assetCheckList);
    }
    await this.storage.set('AssetsChecklist', cashedAssetsChecklist);
  }
  async getAssetChecklistFromDb() {
    let cashedAssetsChecklist = await this.storage.get('AssetsChecklist') || [];
    if (cashedAssetsChecklist)
      this.assetCheckList = cashedAssetsChecklist.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
  }
  async saveAssetDocumentsInDb() {
    this.assetDocuments.map((el: any) => {
      el.assetId = + this.assetId,
        el.userId = this.userId
    })
    let cashedAssetsDocuments = await this.storage.get('AssetsDocuments') || [];
    if (cashedAssetsDocuments) {
      // check if Category  id is in cahce
      let oldList = cashedAssetsDocuments.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
      //remove old info
      cashedAssetsDocuments = cashedAssetsDocuments.filter((el: any) => !oldList.includes(el));
      //push new list
      cashedAssetsDocuments.push(...this.assetDocuments);
    } else {
      cashedAssetsDocuments.push(...this.assetDocuments);
    }
    await this.storage.set('AssetsDocuments', cashedAssetsDocuments);
  }
  async getAssetDocumentsFromDb() {
    let cashedAssetsDocuments = await this.storage.get('AssetsDocuments') || [];
    if (cashedAssetsDocuments)
      this.assetDocuments = cashedAssetsDocuments.filter((el: any) => el.assetId == +this.assetId && el.userId == this.userId);
  }

}
