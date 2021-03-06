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
} from "@angular/animations"; import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { RecordStatus } from 'src/app/core/enums/status.enum';
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
  step = 1;
  pendingItems: any = [];
  completeItems: any = [];
  body = {
    FromCreationDate: '',
    ToCreationDate: '',
    FormId: 0,
    Record_Status: 0
  };

  params: any;
  formRef = ''
  id!: number;
  isOnline = true;
  statusSubscription!: Subscription;
  recordStatus = RecordStatus;
  assetId!: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService,
    private offline: OfflineService,
    private storage: Storage,
    private helper: HelperService,
    private http: HttpService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.id ? this.body.FormId = +this.id : '';
    this.params = this.route.snapshot.queryParams;
    this.assetId = +this.params.assetId;
    
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (!isOnline) {
        this.loadFromCache();
      } else {
        this.loadFromApi()
      }
    });

  }


  loadFromApi() {
    if (this.isOnline) {
      this.getAllPending();
    }
  }
  getAllPending() {
    this.body.Record_Status = 1;
    this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe((value: any) => {
      this.pendingItems = [...value];
    });
  }
  getAllComplete() {
    this.body.Record_Status = 2;
    this.http.get('ChecklistRecords/ReadFormRecords', this.body).subscribe((value: any) => {
      this.completeItems = [...value];
    });
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
    this.step = step;
    if (this.isOnline) {
      step == 1 && this.pendingItems.length == 0 ? this.getAllPending() : '';
      step == 2 && this.completeItems.length == 0 ? this.getAllComplete() : '';
    }
  }

  filterPending(event: any) {
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllPending();
  }
  filterComplete(event: any) {
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllComplete();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }
}
