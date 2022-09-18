import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsInfoComponent } from './assets-info.component';

describe('AssetsInfoComponent', () => {
  let component: AssetsInfoComponent;
  let fixture: ComponentFixture<AssetsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
