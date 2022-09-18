import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef

  @Input() items: any = [];
  @Input() access: any;
  @Output() date: any = new EventEmitter()

  id!: number;
  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;

  accessTypes = AccessTypes;

  rangeDate = {
    FromCreationDate: '',
    ToCreationDate: ''
  }

  constructor(
    private router: Router,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
  }
  clickPrint(event: any) {
    event.stopPropagation();
  }

  apply() {
    this.date.emit(this.rangeDate);
    this.closeModal.nativeElement.click()

  }
  routeWithWorkFlow(item: any) {
    if (this.access && ( this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update) ))
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + item?.form_Id + "&Record_Id=" + +item?.record_Id)
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeWithNoWorkFlow(item: any) {
    if (this.access && ( this.access.includes(this.accessTypes.Read) || this.access.includes(this.accessTypes.Update) ))
      this.router.navigateByUrl("/page/checklist/" + +item?.form_Id + "?editMode=true&Complete=true" +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.form_Title +
        "&Record_Id=" + +item.record_Id);
    else {
      this.alert.error("You have No Access")
      return;
    }
  }

}
