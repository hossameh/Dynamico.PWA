import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacitorCameraFileComponent } from './capacitor-camera-file.component';

describe('CapacitorCameraFileComponent', () => {
  let component: CapacitorCameraFileComponent;
  let fixture: ComponentFixture<CapacitorCameraFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CapacitorCameraFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CapacitorCameraFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
