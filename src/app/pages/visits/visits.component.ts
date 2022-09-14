import { OfflineService } from './../../services/offline/offline.service';
import { HelperService } from './../../services/helper.service';
import { AlertService } from './../../services/alert/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from './../../services/http/http.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations"; import { Component, HostListener, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { RecordStatus } from 'src/app/core/enums/status.enum';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';
@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.scss'],
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


  ],
})
export class VisitsComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.isOnline && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
      // Load Your Data Here
      this.pager.page += 1;
      if (this.step == 1)
        this.getAllPending()
      if (this.step == 2)
        this.getAllComplete()
    }
  }


  step = 1;
  pendingItems: any = [];
  completeItems: any = [];
  body = {
    FromCreationDate: '',
    ToCreationDate: '',
    FormId: 0,
    Record_Status: 0,
    pageIndex: 1,
    pageSize: 10
  };

  params: any;
  formRef = ''
  id!: number;
  isOnline = true;
  statusSubscription!: Subscription;
  recordStatus = RecordStatus;
  assetId!: any;
  access!: any;
  accessTypes = AccessTypes;

  pager!: IPageInfo;
  loaded = true;
  isLoading = false;
  userId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private offline: OfflineService,
    private storage: Storage,
    private helper: HelperService,
    private http: HttpService) { }

  ngOnInit(): void {
    this.resetData();
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.id = this.route.snapshot.params.id;
    this.id ? this.body.FormId = +this.id : '';
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;
    // this.access = this.params.access;

    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
    if (this.id)
      this.GetChecklistUserAccess();
    this.step == 1 ? this.getAllPending() : '';
    this.step == 2 ? this.getAllComplete() : '';
  }

  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  // loadFromApi() {
  //   // if (this.isOnline) {
  //   this.getAllPending();
  //   // }
  // }
  async GetChecklistUserAccess() {
    let cashedUserAccess = await this.storage.get('ChecklistUserAccess') || [];
    let index = cashedUserAccess.findIndex((el: any) => {
      return el.userId == this.userId && el.formId == +this.id
    });
    if (this.isOnline)
      this.http.get('Checklist/GetChecklistUserAccess', { formId: +this.id, userId: this.userId })
        .subscribe(async (res: any) => {
          this.access = res.access;
          let cashObj = {
            access: this.access,
            formId: +this.id,
            userId: this.userId
          }
          index >= 0 ? cashedUserAccess[index] = cashObj : cashedUserAccess.push(cashObj);

          await this.storage.set("ChecklistUserAccess", cashedUserAccess);
        })
    else
      index >= 0 ? this.access = cashedUserAccess[index]?.access : this.access = null;
  }
  async getAllPending() {
    this.body.Record_Status = 1;
    if (this.isOnline) {
      this.loaded = false;
      this.isLoading = true;
      this.body.pageIndex = this.pager.page;
      this.body.pageSize = this.pager.pageSize as number;
      this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe(async (res: any) => {
        res?.list.map((el: any) => {
          el.userId = this.userId;
          this.pendingItems.push(el);
        });
        this.pager.total = res?.total;
        this.pager.pages = res?.pages;
        this.loaded = true;
        this.isLoading = false;
        // if (!this.body.FromCreationDate && !this.body.ToCreationDate) {
        //   await this.storage.set('Records', this.pendingItems);
        // }
        await this.upsertCashedPending();
      });
    }
    else {
      await this.getPendingFromCache()
    }
    // this.pendingItems = [...value];
  }
  async getAllComplete() {
    if (this.isOnline) {
      this.body.Record_Status = 2;
      this.loaded = false;
      this.isLoading = true;
      this.body.pageIndex = this.pager.page;
      this.body.pageSize = this.pager.pageSize as number;
      this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe(async (res: any) => {
        res?.list.map((el: any) => {
          el.userId = this.userId;
          this.completeItems.push(el);
        });
        this.pager.total = res?.total;
        this.pager.pages = res?.pages;
        this.loaded = true;
        this.isLoading = false;
        // if (!this.body.FromCreationDate && !this.body.ToCreationDate) {
        //   await this.storage.set('CompletedRecords', this.completeItems);
        // }
        await this.upsertCashedCompleted();
      });
    }
    else {
      await this.getCompletedFromCache();
    }
    // this.completeItems = [...value];
  }
  async upsertCashedPending() {
    let cashedPendingRecords = await this.storage.get('Records') || [];
    let userCashedPendingRecords = cashedPendingRecords.filter((el: any) => el.userId == this.userId && el.form_Id == this.id);
    cashedPendingRecords = cashedPendingRecords.filter((el: any) => !(el.userId == this.userId && el.form_Id == this.id));

    this.pendingItems.forEach((record: any) => {
      // check if Record is in cahce
      let index = userCashedPendingRecords.findIndex((el: any) => {
        return el.userId == this.userId && el.record_Id == record.record_Id;
      });
      // check if Record  is in cahce update data in this index        
      if (index >= 0) {
        let recordJson = userCashedPendingRecords[index].record_Json;
        record.record_Json = recordJson;
        //if not found id add a new record
        cashedPendingRecords.unshift(record);
      }
      else
        cashedPendingRecords.unshift(record);
    });
    await this.storage.set('Records', cashedPendingRecords);
  }
  async upsertCashedCompleted() {
    let cashedCompletedRecords = await this.storage.get('CompletedRecords') || [];
    let userCashedCompletedRecords = cashedCompletedRecords.filter((el: any) => el.userId == this.userId && el.form_Id == this.id);
    cashedCompletedRecords = cashedCompletedRecords.filter((el: any) => !(el.userId == this.userId && el.form_Id == this.id));
    this.completeItems.forEach((record: any) => {
      // check if Record is in cahce
      let index = userCashedCompletedRecords.findIndex((el: any) => {
        return el.userId == this.userId && el.record_Id == record.record_Id;
      });
      // check if Record  is in cahce update data in this index
      if (index >= 0) {
        let recordJson = userCashedCompletedRecords[index].record_Json;
        record.record_Json = recordJson;
        //if not found id add a new record
        cashedCompletedRecords.unshift(record);
      }
      else
        cashedCompletedRecords.unshift(record);
    });
    await this.storage.set('CompletedRecords', cashedCompletedRecords);
  }
  async getPendingFromCache() {
    this.pendingItems = [];
    let cacheRecords = await this.storage.get('Records') || [];
    cacheRecords = cacheRecords.filter((el: any) => el.userId == this.userId && el.form_Id == this.id);

    if (this.body.FromCreationDate) {
      cacheRecords = cacheRecords.filter((el: any) =>
        ((new Date(el.creation_Date)).getTime() >= (new Date(this.body.FromCreationDate)).getTime())
      );
    }
    if (this.body.ToCreationDate) {
      cacheRecords = cacheRecords.filter((el: any) =>
        ((new Date(el.creation_Date)).getTime() <= (new Date(this.body.ToCreationDate)).getTime())
      );
    }

    if (cacheRecords.length > 0) {
      cacheRecords.map((el: any) => {
        el.form_Title = this.params?.listName;
      });
    }
    this.pendingItems = cacheRecords;
  }
  async getCompletedFromCache() {
    this.completeItems = [];
    let cacheCompletedRecords = await this.storage.get('CompletedRecords') || [];
    cacheCompletedRecords = cacheCompletedRecords.filter((el: any) => el.userId == this.userId && el.form_Id == this.id);
    if (this.body.FromCreationDate) {
      cacheCompletedRecords = cacheCompletedRecords.filter((el: any) =>
        ((new Date(el.creation_Date)).getTime() >= (new Date(this.body.FromCreationDate)).getTime())
      );
    }
    if (this.body.ToCreationDate) {
      cacheCompletedRecords = cacheCompletedRecords.filter((el: any) =>
        ((new Date(el.creation_Date)).getTime() <= (new Date(this.body.ToCreationDate)).getTime())
      );
    }
    if (cacheCompletedRecords.length > 0) {
      cacheCompletedRecords.map((el: any) => {
        el.form_Title = this.params?.listName;
      });
    }
    this.completeItems = cacheCompletedRecords;
  }
  change(step: number) {
    this.resetData().then((res) => {
      this.step = step;
      // if (this.isOnline) {
      step == 1 ? this.getAllPending() : '';
      step == 2 ? this.getAllComplete() : '';
      // }
    });
  }

  filterPending(event: any) {
    this.resetData().then((res) => {
      this.body.FromCreationDate = event.FromCreationDate;
      this.body.ToCreationDate = event.ToCreationDate;
      this.getAllPending();
    });
  }
  filterComplete(event: any) {
    this.resetData().then((res) => {
      this.body.FromCreationDate = event.FromCreationDate;
      this.body.ToCreationDate = event.ToCreationDate;
      this.getAllComplete();
    });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }
  bottomReached(): boolean {
    return ((document.documentElement.offsetHeight + document.documentElement.scrollTop + 100) >= document.documentElement.scrollHeight);
    // return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 0.5);
  }
  scrollToTop() {
    window.scroll(0, 0);
  }
  resetData(): Promise<boolean> {
    this.pendingItems = [];
    this.completeItems = [];
    this.body.FromCreationDate = '';
    this.body.ToCreationDate = '';
    this.resetPager();
    return Promise.resolve(true);
  }
}
