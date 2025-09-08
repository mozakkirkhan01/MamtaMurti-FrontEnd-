import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPrescriptionListComponent } from './patient-prescription-list.component';

describe('PatientPrescriptionListComponent', () => {
  let component: PatientPrescriptionListComponent;
  let fixture: ComponentFixture<PatientPrescriptionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientPrescriptionListComponent]
    });
    fixture = TestBed.createComponent(PatientPrescriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
