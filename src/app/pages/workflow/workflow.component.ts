import { Subscription } from 'rxjs';
import { OfflineService } from './../../services/offline/offline.service';
import { HelperService } from './../../services/helper.service';
import { HttpService } from './../../services/http/http.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Storage } from '@ionic/storage-angular';
import { IPageInfo } from 'src/app/core/interface/page-info.interface';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss'],
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
export class WorkflowComponent implements OnInit {

  @HostListener("window:scroll", [])
  onScroll(): void {
    if (this.bottomReached() && this.loaded && this.pager.page <= (this.pager.pages - 1)) {
      // Load Your Data Here
      this.pager.page += 1;
      if (this.step == 1)
        this.getData(false)
      if (this.step == 2)
        this.getData(true)
    }
  }

  step = 1;
  isOnline = true;
  $subscription!: Subscription;

  pendingItems: any = [];
  historyItems: any = [];
  pager!: IPageInfo;
  loaded = true;
  isLoading = false;
  constructor(
    private http: HttpService,
    private offline: OfflineService,
    private storage: Storage,
    private helper: HelperService,
  ) { }

  ngOnInit(): void {
    this.resetData();
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (isOnline) {
        this.getWorkflowCount();
      }
      this.getData();
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

  getWorkflowCount() {
    this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(res => {
      this.helper.getingCount.next(res);
    })
  }

  change(step: number) {
    this.resetData();
    this.step = step;
    step == 1 ? this.getData(false) : '';
    step == 2 ? this.getData(true) : '';
    // if (this.isOnline) {
    //   step == 1 && this.pendingItems.length == 0 ? this.getData(false) : '';
    //   step == 2 && this.historyItems.length == 0 ? this.getData(true) : '';
    // }
  }
  async getData(isHistory = false) {
    let params = {
      PageIndex: this.pager.page,
      PageSize: this.pager.pageSize as number,
      IsHistory: isHistory
    }
    if (this.isOnline) {
      this.loaded = false;
      this.isLoading = true;
      this.http.get('ChecklistRecords/GetPendingAndHistoryWorkflowFormData', params).subscribe(async (res: any) => {
        res?.list.map((el: any) => {
          isHistory ? this.historyItems.push(el) : this.pendingItems.push(el);
        });
        // isHistory ? this.historyItems = res.list : this.pendingItems = res.list;
        this.pager.total = res?.total;
        this.pager.pages = res?.pages;
        this.loaded = true;
        this.isLoading = false;
        isHistory ? await this.storage.set("HistoryWorkflow", this.historyItems) :
          await this.storage.set("PendingWorkflow", this.pendingItems);
      })
    }
    else {
      isHistory ? this.historyItems = await this.storage.get('HistoryWorkflow') || [] :
        this.pendingItems = await this.storage.get('PendingWorkflow') || []
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.$subscription.unsubscribe();
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
    this.historyItems = [];
    this.resetPager();
  }
}
