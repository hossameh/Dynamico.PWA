import { Subscription } from 'rxjs';
import { OfflineService } from './../../services/offline/offline.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { RecordStatus } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  grade = true;
  items = [];
  itemsDateView = [];
  plansRecords: any[] = [];
  Subscription!: Subscription;
  isOnline = true;
  userId: any;
  recordStatus = RecordStatus;

  constructor(private http: HttpService,
    private offline: OfflineService,
    private storage: Storage,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.Subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      // if (isOnline) {
      //   this.toggle();
      // }
    });
    this.toggle();
  }


  async toggle() {
    let goToList = await this.storage.get("BackToPlan") || null;
    if (goToList) {
      this.grade = false;
      await this.storage.remove("BackToPlan");
    }
    this.grade = !this.grade;
    if (this.grade) {
      this.getPlans();
    } else {
      this.getPlansForDateView();
    }
  }

  async getPlans(isComplete: any = null) {
    this.plansRecords = [];
    let cashedListPlans = (isComplete == true) ? (await this.storage.get("CompletedListPlans") || []) :
      (await this.storage.get("ListPlans") || []);
    let userCashedListPlans = cashedListPlans.filter((el: any) => el.userId == this.userId);
    cashedListPlans = cashedListPlans.filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body: any = {};
      body.pageIndex = 1;
      body.pageSize = 10;
      body.UserId = this.userId;
      if (isComplete)
        body.ShowCompletedForms = isComplete;
      this.http.get('Plans/MobileGetPlans', body).subscribe(async (value: any) => {
        this.items = value.list;
        this.items.map((el: any) => {
          el.userId = this.userId;
          cashedListPlans.push(el);
          let records = el.list;
          records.forEach((element: any) => {
            if (element.isCreateFormData == true && element.plannerFormsData && element.plannerFormsData[0].formsData) {
              let record = element.plannerFormsData[0].formsData;
              this.plansRecords.push({
                record_Id: record.formDataId,
                form_Id: record.formId,
                creation_Date: null,
                assigned_Date: null,
                createdBy: null,
                form_Title: element.form.formTitle,
                record_Status_Id: record.recordStatusId,
                gpS_Required: false,
                location: "",
                formDataRef: record.formDataRef,
                workflowId: element.form.workflowId,
                userId: this.userId
              });
            }
          });

        });
        if (this.plansRecords && this.plansRecords.length > 0)
          this.updateCashedRecord();
        await (isComplete == true) ? this.storage.set("CompletedListPlans", cashedListPlans) :
          this.storage.set("ListPlans", cashedListPlans);
      });
    }
    else
      this.items = userCashedListPlans;
  }

  showCompleted(event: boolean) {
    this.getPlans(event)
  }
  showCompletedDateView(event: boolean) {
    this.getPlansForDateView(event)
  }
  async getPlansForDateView(isComplete: any = false) {
    let cashedDateViewPlans = isComplete ? (await this.storage.get("CompletedDateViewPlans") || [])
      : (await this.storage.get("DateViewPlans") || []);
    let userCashedDateViewPlans = cashedDateViewPlans.filter((el: any) => el.userId == this.userId);
    cashedDateViewPlans = cashedDateViewPlans.filter((el: any) => el.userId !== this.userId);
    if (this.isOnline) {
      let body = {
        ShowCompletedForms: isComplete,
        UserId: this.userId
      };
      this.http.get('Plans/GetPlans', body).subscribe(async (value: any) => {
        this.itemsDateView = value.list;
        this.itemsDateView.map((el: any) => {
          el.userId = this.userId;
          cashedDateViewPlans.push(el);
        });
        await isComplete ? this.storage.set("CompletedDateViewPlans", cashedDateViewPlans)
          : this.storage.set("DateViewPlans", cashedDateViewPlans);
      });
    }
    else
      this.itemsDateView = userCashedDateViewPlans;

  }
  async updateCashedRecord() {
    let cashedRecords = await this.storage.get('Records') || [];
    let cashedCompletedRecords = await this.storage.get('CompletedRecords') || [];
    this.plansRecords.forEach(element => {
      if (element.record_Status_Id == this.recordStatus.Created ||
        element.record_Status_Id == this.recordStatus.Assigned || element.record_Status_Id == this.recordStatus.PendingApproval) {
        let index = cashedRecords.findIndex((el: any) => {
          return el.userId == this.userId && el.form_Id == element.form_Id && el.record_Id == element.record_Id;
        });
        if (index >= 0)
          cashedRecords[index].record_Status_Id = element.record_Status_Id;
        else
          cashedRecords.unshift(element);
      }
      if (element.record_Status_Id == this.recordStatus.Completed ||
        element.record_Status_Id == this.recordStatus.Approved || element.record_Status_Id == this.recordStatus.Rejected) {
        let index = cashedCompletedRecords.findIndex((el: any) => {
          return el.userId == this.userId && el.form_Id == element.form_Id && el.record_Id == element.record_Id;
        });
        if (index >= 0)
          cashedCompletedRecords[index].record_Status_Id = element.record_Status_Id;
        else
          cashedCompletedRecords.unshift(element);
      }
    });
    await this.storage.set('Records', cashedRecords);
    await this.storage.set('CompletedRecords', cashedCompletedRecords);
  }
}
