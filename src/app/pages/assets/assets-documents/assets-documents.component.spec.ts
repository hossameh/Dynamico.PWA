import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsDocumentsComponent } from './assets-documents.component';

describe('AssetsDocumentsComponent', () => {
  let component: AssetsDocumentsComponent;
  let fixture: ComponentFixture<AssetsDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
