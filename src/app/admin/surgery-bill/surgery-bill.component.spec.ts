import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryBillComponent } from './surgery-bill.component';

describe('SurgeryBillComponent', () => {
  let component: SurgeryBillComponent;
  let fixture: ComponentFixture<SurgeryBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurgeryBillComponent]
    });
    fixture = TestBed.createComponent(SurgeryBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
