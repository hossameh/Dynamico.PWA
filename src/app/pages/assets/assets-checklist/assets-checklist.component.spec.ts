import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsChecklistComponent } from './assets-checklist.component';

describe('AssetsChecklistComponent', () => {
  let component: AssetsChecklistComponent;
  let fixture: ComponentFixture<AssetsChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
