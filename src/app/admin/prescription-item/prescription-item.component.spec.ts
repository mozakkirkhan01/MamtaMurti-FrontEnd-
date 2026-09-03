import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionItemComponent } from './prescription-item.component';

describe('PrescriptionItemComponent', () => {
  let component: PrescriptionItemComponent;
  let fixture: ComponentFixture<PrescriptionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrescriptionItemComponent]
    });
    fixture = TestBed.createComponent(PrescriptionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
