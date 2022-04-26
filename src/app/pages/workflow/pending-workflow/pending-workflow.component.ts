import { WorkflowStatus } from './../../../core/enums/status.enum';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pending-workflow',
  templateUrl: './pending-workflow.component.html',
  styleUrls: ['./pending-workflow.component.scss']
})
export class PendingWorkflowComponent implements OnInit {
  @Input() items: any = [];
  WorkflowStatus=WorkflowStatus
  constructor() { }

  ngOnInit(): void {
  }

}
