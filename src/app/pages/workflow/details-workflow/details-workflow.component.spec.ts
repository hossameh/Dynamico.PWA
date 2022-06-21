import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsWorkflowComponent } from './details-workflow.component';

describe('DetailsWorkflowComponent', () => {
  let component: DetailsWorkflowComponent;
  let fixture: ComponentFixture<DetailsWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
