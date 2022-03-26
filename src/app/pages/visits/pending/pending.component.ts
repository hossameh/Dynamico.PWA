import { AlertService } from './../../../services/alert/alert.service';
import { HttpService } from './../../../services/http/http.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss']
})
export class PendingComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef
  @ViewChild('closeModal2') closeModal2!: ElementRef

  @Input() items:any = [];
  @Output() date:any = new EventEmitter()

  id!:number

  rangeDate = {
    FromCreationDate:'',
    ToCreationDate:''
  }

  constructor(private http: HttpService, private alert:AlertService) { }

  ngOnInit(): void {
  }

  delete(){
    this.http.post('Records/DeleteFormRecord',null,true,{Record_Id: this.id}).subscribe((res:any) => {

      if(res.isPassed){
        this.closeModal.nativeElement.click()
      }else{
        this.alert.error(res.message)
      }

    })
  }

  apply(){
    this.date.emit(this.rangeDate);
    this.closeModal2.nativeElement.click()
  }

}
