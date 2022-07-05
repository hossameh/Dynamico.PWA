import { OfflineService } from './../../../services/offline/offline.service';
import { Storage } from '@ionic/storage';
import { AlertService } from './../../../services/alert/alert.service';
import { HttpService } from './../../../services/http/http.service';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;

  @Input() items: any = [];
  @Output() date: any = new EventEmitter();

  id!: number;
  selectedItem: any;

  rangeDate = {
    FromCreationDate: '',
    ToCreationDate: ''
  };

  isOnline = true;
  statusSubscription!: Subscription;
  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;

  constructor(
    private http: HttpService,
    private alert: AlertService,
    private storage: Storage,
    private offline: OfflineService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.statusSubscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }
  editBtnClic(event : any) {
    event.stopPropagation();
  }
  delete() {

    if (this.isOnline) {
      this.http.post('ChecklistRecords/DeleteFormRecord', null, true, { Record_Id: this.selectedItem.record_Id }).subscribe((res: any) => {

        if (res.isPassed) {
          this.closeModal.nativeElement.click();
        } else {
          this.alert.error(res.message);
        }

      });
    } else {
      this.deleteFromDB();
    }

  }

  async deleteFromDB() {
    let cacheRecords = await this.storage.get('Records') || [];
    if (cacheRecords.length > 0) {
      let index = cacheRecords.findIndex((el: any) => {
        return el.offlineRef == this.selectedItem?.offlineRef;
      });
      let indexItem = this.items.findIndex((el: any) => {
        return el.offlineRef == this.selectedItem?.offlineRef;
      });
      index >= 0 ? cacheRecords.splice(index, 1) : '';
      indexItem >= 0 ? this.items.splice(indexItem, 1) : '';
    }
    await this.storage.set('Records', cacheRecords);
    this.closeModal.nativeElement.click();
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
}
