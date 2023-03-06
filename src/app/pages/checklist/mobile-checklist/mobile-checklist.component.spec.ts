import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileChecklistComponent } from './mobile-checklist.component';

describe('MobileChecklistComponent', () => {
  let component: MobileChecklistComponent;
  let fixture: ComponentFixture<MobileChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
