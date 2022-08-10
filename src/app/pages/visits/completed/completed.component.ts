import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';

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

  constructor() { }

  ngOnInit(): void {
  }
  clickPrint(event: any) {
    event.stopPropagation();
  }

  apply() {
    this.date.emit(this.rangeDate);
    this.closeModal.nativeElement.click()

  }

}
