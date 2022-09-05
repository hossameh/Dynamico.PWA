import { dates } from './../../../core/interface/api.interface';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardViewComponent implements OnInit {
  @Input() items: dates[] = []
  @Output() showCompleted = new EventEmitter();
  isChecked = false
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toggle() {
    setTimeout(() => {
      this.showCompleted.emit(this.isChecked);
    }, 50)
  }
  go(item: any) {
    let complete = false;
    // if (this.access && this.access.toString().includes(this.accessTypes.Read)) {
    //   if (!this.access.includes(this.accessTypes.Update))
    complete = true;

    this.router.navigateByUrl("/page/checklist/" + item.formId + "?editMode=true" +
      (complete == true ? "&Complete=true" : "") +
      "&offline=" + '' +
      "&listName=" + item.form.formTitle +
      "&Record_Id=" + item?.plannerFormsData[0]?.formsDataId);
    // }
    // else {
    //   this.alert.error("You have No Access")
    //   return;
    // }

  }
}
