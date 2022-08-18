import { AlertService } from './../../services/alert/alert.service';
import { HttpService } from './../../services/http/http.service';
import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter
} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { Location } from '@angular/common';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('SearchInput', { static: true }) SearchInput!: ElementRef;
  @ViewChild('closeModal') closeModal!: ElementRef

  items: any = [];
  searchObj: any = {
    complete: false,
    pending: false,
    searchKey: ""
  };

  selectedItem: any;

  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;

  accessTypes = AccessTypes;
  params: any;

  constructor(private http: HttpService,
    private location: Location,
    private alert: AlertService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;


    fromEvent(this.SearchInput.nativeElement, 'keyup').pipe(

      // get value
      map((event: any) => {
        return event.target.value;
      })
      // // if character length greater then 1
      // , filter(res => res.length >= 1)

      // Time in milliseconds between key events
      , debounceTime(1000)

      // If previous query is diffent from current
      , distinctUntilChanged()

      // subscription for response
    ).subscribe((text: string) => {
      this.searchObj.searchKey = text;
      this.search();

    });
  }


  search() {
    let body = {
      TitleOrREF: this.searchObj.searchKey,
      Record_Status: (this.searchObj.complete && this.searchObj.pending) ? '' : this.searchObj.complete ? 2 : this.searchObj.pending ? 1 : ''
    };
    this.http.get('ChecklistRecords/ReadUserFormRecords', body).subscribe((value: any) => {
      this.items = value;
    });
  }

  delete() {
    this.http.post('ChecklistRecords/DeleteFormRecord', null, true, { Record_Id: this.selectedItem.record_Id }).subscribe((res: any) => {
      if (res.isPassed) {
        this.closeModal.nativeElement.click();
        this.search()
      } else {
        this.alert.error(res.message)
      }

    })
  }

  back(): void {
    this.location.back();
  };
  editBtnClic(event: any) {
    event.stopPropagation();
  }
  routeWithWorkFlow(item: any) {
    if (item?.access && (item?.access.includes(this.accessTypes.Read) || item?.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + item?.form_Id + "&Record_Id=" + +item?.record_Id)
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeWithNoWorkFlow(item: any) {
    if (item?.access && (item?.access.includes(this.accessTypes.Read) || item?.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/checklist/" + +item?.form_Id + "?editMode=true&Complete=true" +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.form_Title +
        "&Record_Id=" + +item.record_Id);
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeIfCreatedOrAssigned(item: any) {
    let complete = false;
    if (item?.access && item?.access.toString().includes(this.accessTypes.Read)) {
      if (!item?.access.includes(this.accessTypes.Update))
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
