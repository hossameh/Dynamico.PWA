import { HttpService } from './../../services/http/http.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";import { Component, OnInit } from '@angular/core';

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
  pendingItems:any = []
  completeItems:any = []
  body = {
    FromCreationDate:'',
    ToCreationDate:'',
    Record_Status:0

  }
  constructor(
    private http: HttpService) { }

  ngOnInit(): void {
    this.getAllPending()
  }


  getAllPending(){
    this.body.Record_Status = 1;
    this.http.get('Records/ReadFormRecords',this.body).subscribe((value:any) =>{
      this.pendingItems = [...value]
    })
  }
  getAllComplete(){
    this.body.Record_Status = 2;
    this.http.get('Records/ReadFormRecords',this.body).subscribe((value:any) =>{
      this.completeItems = [...value]
    })
  }

  change(step:number){
    step == 1 ? this.step = 1 : this.step = 2;

    step == 1 && this.pendingItems.length == 0 ? this.getAllPending() : '';
    step == 2 && this.completeItems.length == 0 ? this.getAllComplete() : '';

  }

  filterPending(event:any){
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllPending()
  }
  filterComplete(event:any){
    this.body.FromCreationDate = event.FromCreationDate;
    this.body.ToCreationDate = event.ToCreationDate;
    this.getAllComplete()
  }
}
