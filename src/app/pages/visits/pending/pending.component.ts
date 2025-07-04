import { OfflineService } from './../../../services/offline/offline.service';
import { Storage } from '@ionic/storage';
import { AlertService } from './../../../services/alert/alert.service';
import { HttpService } from './../../../services/http/http.service';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { Router } from '@angular/router';
import { Role } from '../../../core/enums/role.enum';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;

  @Input() items: any = [];
  @Input() access: any;
  @Output() date: any = new EventEmitter();

  accessTypes = AccessTypes;
  id!: number;
  selectedItem: any;
  userRole!: string;

  rangeDate = {
    FromCreationDate: '',
    ToCreationDate: ''
  };
  currentUser: any;
  isOnline = true;
  statusSubscription!: Subscription;
  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;
  userId: any; role = Role;

  constructor(
    private http: HttpService,
    private alert: AlertService,
    private storage: Storage,
    private offline: OfflineService,
    private elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userRole = JSON.parse(localStorage.getItem('userData') || '{}').userType;

    this.userId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }
  editBtnClic(event: any) {
    event.stopPropagation();
  }
  delete() {
    if (this.isOnline) {
      this.http.post('ChecklistRecords/DeleteFormRecord', null, true, { Record_Id: this.selectedItem.record_Id }).subscribe((res: any) => {
        if (res.isPassed) {
          this.date.emit(this.rangeDate);
          this.closeModal.nativeElement.click();
          this.deleteFromDB(false);
          this.deleteCashedPlanRecords();
        } else {
          console.log(res.message);
          this.alert.error("Something Went Wrong !");
        }
      });
    } else {
      this.deleteFromDB(true);
      this.deleteCashedPlanRecords();
    }

  }

  async deleteFromDB(offline: boolean) {
    let cacheRecords = await this.storage.get('Records') || [];
    let recordsWillBeUpserted = await this.storage.get('RecordsWillBeUpserted') || [];
    let recordsWillBeDeleted = await this.storage.get('RecordsWillBeDeleted') || [];
    if (offline && this.selectedItem.record_Id && this.selectedItem.record_Id > 0) {
      recordsWillBeDeleted.push({ userId: this.userId, Record_Id: this.selectedItem.record_Id });
      await this.storage.set("RecordsWillBeDeleted", recordsWillBeDeleted);
    }
    if (cacheRecords.length > 0) {
      if (this.selectedItem.record_Id) {
        let index = cacheRecords.findIndex((el: any) => {
          return el.userId == this.userId && el.record_Id == this.selectedItem.record_Id;
        });
        let indexItem = this.items.findIndex((el: any) => {
          return el.userId == this.userId && el.record_Id == this.selectedItem.record_Id;
        });
        index >= 0 ? cacheRecords.splice(index, 1) : '';
        indexItem >= 0 ? this.items.splice(indexItem, 1) : '';
      }
      else {
        let index = cacheRecords.findIndex((el: any) => {
          return el.userId == this.userId && el.offlineRef == this.selectedItem?.offlineRef;
        });
        let indexItem = this.items.findIndex((el: any) => {
          return el.userId == this.userId && el.offlineRef == this.selectedItem?.offlineRef;
        });
        index >= 0 ? cacheRecords.splice(index, 1) : '';
        indexItem >= 0 ? this.items.splice(indexItem, 1) : '';
      }
    }
    if (recordsWillBeUpserted.length > 0) {
      let index = recordsWillBeUpserted.findIndex((el: any) => {
        return el.userId == this.userId && el.offlineRef == this.selectedItem?.offlineRef;
      });
      index >= 0 ? recordsWillBeUpserted.splice(index, 1) : '';
    }
    await this.storage.set('RecordsWillBeUpserted', recordsWillBeUpserted);
    await this.storage.set('Records', cacheRecords);
    //save in actions to take later when online
    this.closeModal.nativeElement.click();
  }
  async deleteCashedPlanRecords() {
    let cashedListPlans = await this.storage.get("ListPlans") || [];
    cashedListPlans.forEach((day: any) => {
      let index = day.list.findIndex((element: any) =>
        element.isCreateFormData == true && element.plannerFormsData
        && element.plannerFormsData[0].formsData
        && element.plannerFormsData[0].formsData.formDataId == +this.selectedItem.record_Id
        && element.plannerFormsData[0].formsData.userId == this.userId);
      if (index >= 0) {
        day.list.splice(index, 1);
      }
    });
    await this.storage.set("ListPlans", cashedListPlans)
  }
  apply() {
    this.date.emit(this.rangeDate);
    this.closeModal2.nativeElement.click();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.statusSubscription.unsubscribe();
  }
  routeWithWorkFlow(item: any) {
    if (this.access && (this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + item?.form_Id + "&Record_Id=" + +item?.record_Id +
        "&offline=" + (item.offlineRef ? item.offlineRef : '')) 
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeWithNoWorkFlow(item: any) {
    let complete = true;

    if (this.access && (this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update))) {
      if (this.currentUser?.allowMultiCustomers && this.userRole == this.role.CompanyAdmin)
        complete = false;

      this.router.navigateByUrl("/page/checklist/" + +item?.form_Id + "?editMode=true" +

        (complete == true ? "&Complete=true" : "") +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.form_Title +
        "&Record_Id=" + +item.record_Id);
    } else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeIfCreatedOrAssigned(item: any) {
    let complete = false;
    if (this.access && this.access.toString().includes(this.accessTypes.Read)) {
      if (!this.access.includes(this.accessTypes.Update))
        complete = true;
      this.router.navigateByUrl("/page/checklist/" + +item?.form_Id + "?editMode=true" +
        (complete == true ? "&Complete=true" : "") +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.form_Title +
        "&Record_Id=" + +item.record_Id);
    }
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
}
