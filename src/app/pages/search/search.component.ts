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

  selectedItem:any

  constructor(private http: HttpService,
    private location: Location,
    private alert:AlertService
    ) { }

  ngOnInit(): void {
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
      FormId: isNaN(this.searchObj.searchKey) ? '' : this.searchObj.searchKey,
      FormTitle: isNaN(this.searchObj.searchKey) ? this.searchObj.searchKey : '',
      Record_Status: (this.searchObj.complete && this.searchObj.pending) ? '' : this.searchObj.complete ? 2 : this.searchObj.pending ? 1 : ''
    };
    this.http.get('Records/ReadFormRecords', body).subscribe((value: any) => {
      this.items = value;
    });
  }

  delete(){
    this.http.post('Records/DeleteFormRecord',null,true,{Record_Id: this.selectedItem.record_Id}).subscribe((res:any) => {

      if(res.isPassed){
        this.closeModal.nativeElement.click()
      }else{
        this.alert.error(res.message)
      }

    })
  }

  back(): void {
    this.location.back();
  };
}
