import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef

  @Input() items:any = [];
  @Output() date:any = new EventEmitter()

  id!:number

  rangeDate = {
    FromCreationDate:'',
    ToCreationDate:''
  }

  constructor() { }

  ngOnInit(): void {
  }


  apply(){
    this.date.emit(this.rangeDate);
    this.closeModal.nativeElement.click()

  }

}
