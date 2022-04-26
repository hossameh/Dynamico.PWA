import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingWorkflowComponent } from './pending-workflow.component';

describe('PendingWorkflowComponent', () => {
  let component: PendingWorkflowComponent;
  let fixture: ComponentFixture<PendingWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
