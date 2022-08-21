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
    if (this.bottomReached() && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
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
    this.id = this.route.snapshot.params.id;
    this.id ? this.body.FormId = +this.id : '';
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;
    // this.access = this.params.access;

    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (!isOnline) {
        this.loadFromCache();
      } else {
        if (this.id) {
          this.http.get('Checklist/GetChecklistUserAccess', { formId: +this.id, userId: JSON.parse(localStorage.getItem('userData') || '{}').userId })
            .subscribe((res: any) => {
              this.access = res.access;
            })
        }
        this.loadFromApi()
      }
    });

  }

  resetPager() {
    this.pager = {
      page: 1,
      pages: 0,
      pageSize: 10,
      total: 0,
    };
  }
  loadFromApi() {
    if (this.isOnline) {
      this.getAllPending();
    }
  }
  getAllPending() {
    this.body.Record_Status = 1;
    this.loaded = false;
    this.isLoading = true;
    this.body.pageIndex = this.pager.page;
    this.body.pageSize = this.pager.pageSize as number;
    this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe((res: any) => {
      res?.list.map((el: any) => {
        this.pendingItems.push(el);
      });
      this.pager.total = res?.total;
      this.pager.pages = res?.pages;
      this.loaded = true;
      this.isLoading = false;
    });
    // this.pendingItems = [...value];
  }
  getAllComplete() {
    this.body.Record_Status = 2;
    this.loaded = false;
    this.isLoading = true;
    this.body.pageIndex = this.pager.page;
    this.body.pageSize = this.pager.pageSize as number;
    this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe((res: any) => {
      res?.list.map((el: any) => {
        this.completeItems.push(el);
      });
      this.pager.total = res?.total;
      this.pager.pages = res?.pages;
      this.loaded = true;
      this.isLoading = false;
    });
    // this.completeItems = [...value];
  }

  async loadFromCache() {
    this.completeItems = [];
    this.pendingItems = [];
    let cacheRecords = await this.storage.get('Records') || [];
    if (cacheRecords.length > 0) {
      cacheRecords.map((el: any) => {
        el.form_Title = this.params?.listName;
      });

      this.pendingItems = cacheRecords.filter((el: any) => el.isSubmitted == false && el.form_Id == this.id);
      this.completeItems = cacheRecords.filter((el: any) => el.isSubmitted == true && el.form_Id == this.id);
    }
  }
  change(step: number) {
    this.resetData();
    this.step = step;
    if (this.isOnline) {
      step == 1 && this.pendingItems.length == 0 ? this.getAllPending() : '';
      step == 2 && this.completeItems.length == 0 ? this.getAllComplete() : '';
    }
  }

  filterPending(event: any) {
    this.resetData();
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllPending();
  }
  filterComplete(event: any) {
    this.resetData();
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllComplete();
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
  resetData() {
    this.pendingItems = [];
    this.completeItems = [];
    this.body.FromCreationDate = '';
    this.body.ToCreationDate = '';
    this.resetPager();
  }
}
