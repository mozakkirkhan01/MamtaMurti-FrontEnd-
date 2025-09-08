import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionHeadComponent } from './prescription-head.component';

describe('PrescriptionHeadComponent', () => {
  let component: PrescriptionHeadComponent;
  let fixture: ComponentFixture<PrescriptionHeadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrescriptionHeadComponent]
    });
    fixture = TestBed.createComponent(PrescriptionHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
