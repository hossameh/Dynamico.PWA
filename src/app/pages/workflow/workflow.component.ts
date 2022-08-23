import { Subscription } from 'rxjs';
import { OfflineService } from './../../services/offline/offline.service';
import { HelperService } from './../../services/helper.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Storage } from '@ionic/storage-angular';

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
  step = 1;
  isOnline = true;
  $subscription!: Subscription;

  pendingItems: any = [];
  historyItems: any = [];
  constructor(
    private http: HttpService,
    private offline: OfflineService,
    private storage: Storage,
    private helper: HelperService,
  ) { }

  ngOnInit(): void {
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (isOnline) {
        this.getWorkflowCount();
      }
      this.getData();
    });

  }

  getWorkflowCount() {
    this.http.get('ChecklistRecords/GetPendingWorkflowFormDataCount').subscribe(res => {
      this.helper.getingCount.next(res);
    })
  }

  change(step: number) {
    this.step = step;
    step == 1  ? this.getData(false) : '';
    step == 2  ? this.getData(true) : '';
    // if (this.isOnline) {
    //   step == 1 && this.pendingItems.length == 0 ? this.getData(false) : '';
    //   step == 2 && this.historyItems.length == 0 ? this.getData(true) : '';
    // }
  }
  async getData(isHistory = false) {
    let params = {
      PageIndex: 1,
      PageLimit: 10,
      IsHistory: isHistory
    }
    if (this.isOnline)
      this.http.get('ChecklistRecords/GetPendingAndHistoryWorkflowFormData', params).subscribe(async (res: any) => {
        isHistory ? this.historyItems = res.list : this.pendingItems = res.list;
        isHistory ? await this.storage.set("HistoryWorkflow", this.historyItems) :
          await this.storage.set("PendingWorkflow", this.pendingItems);
      })
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
}
