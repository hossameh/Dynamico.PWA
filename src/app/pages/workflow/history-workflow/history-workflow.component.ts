import { WorkflowStatus } from './../../../core/enums/status.enum';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-history-workflow',
  templateUrl: './history-workflow.component.html',
  styleUrls: ['./history-workflow.component.scss']
})
export class HistoryWorkflowComponent implements OnInit {
  @Input() items: any = [];
  WorkflowStatus=WorkflowStatus

  constructor() { }

  ngOnInit(): void {
  }

}
