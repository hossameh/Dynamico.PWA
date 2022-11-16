import { dates } from './../../../core/interface/api.interface';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit {
  @Input() items: dates[] = []
  @Output() showCompleted = new EventEmitter();
  isChecked = false;
  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;
  constructor(private router: Router, private storage: Storage) { }

  ngOnInit(): void {
  }

  toggle() {
    setTimeout(() => {
      this.showCompleted.emit(this.isChecked);
    }, 50)
  }
  go(item: any) {
    let complete = false;
    let recordStatus = item.plannerFormsData[0]?.formsData?.recordStatusId;
    if (recordStatus == this.recordStatus.Assigned || recordStatus == this.recordStatus.Created)
      complete = false;
    else
      complete = true;
    if (item && item.isCreateFormData == true && item.plannerFormsData) {
      this.router.navigateByUrl("/page/checklist/" + item.formId + "?editMode=true" +
        (complete == true ? "&Complete=true" : "") +
        "&offline=" + '' +
        "&listName=" + item.form.formTitle +
        "&Record_Id=" + item?.plannerFormsData[0]?.formsDataId);
    }
    else {
      const queryParams: Params = { editMode: false };
      this.router.navigate(['/page/checklist/' + item.formId], {
        queryParams: queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      })
    }
  }
  async setBack() {
    this.storage.set("BackToPlan", "CardView");
  }
  getStatus(element: any) {
    return this.recordStatus[element?.plannerFormsData[0]?.formsData?.recordStatusId] ?? '';
  }
}
