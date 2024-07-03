import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowControlComponent } from './workflow-control.component';

describe('WorkflowControlComponent', () => {
  let component: WorkflowControlComponent;
  let fixture: ComponentFixture<WorkflowControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
