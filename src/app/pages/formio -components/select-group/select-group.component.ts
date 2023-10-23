import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormioCustomComponent, FormioEvent } from 'angular-formio';

@Component({
  selector: 'app-select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss']
})
export class SelectGroupComponent implements FormioCustomComponent<string>, OnInit {

  @Input() value: string ='';

  @Output()
  valueChange = new EventEmitter<string>();

  @Input()
  data: any = {values:[]};

  @Input()
  disabled: boolean = false;

  constructor() { }

  formioEvent?: EventEmitter<FormioEvent>;

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {


  }

  onValueChanged(event:any) {

    if (event) {
      //  this.value = event;
      this.valueChange.emit(event.value);
    }
  }
}
