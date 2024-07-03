import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormioCustomComponent, FormioEvent } from 'angular-formio';

@Component({
  selector: 'app-workflow-control',
  templateUrl: './workflow-control.component.html',
  styleUrls: ['./workflow-control.component.scss']
})
export class WorkflowControlComponent implements FormioCustomComponent<boolean>, OnInit, OnChanges {

  @Input() workflow!: number;

  @Input() stagesConfig!: any[];



  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {


  }
  value!: boolean;
  valueChange!: EventEmitter<boolean>;
  disabled!: boolean;
  formioEvent?: EventEmitter<FormioEvent>;

  ngOnInit(): void {

  }

}
