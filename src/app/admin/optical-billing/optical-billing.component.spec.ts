import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpticalBillingComponent } from './optical-billing.component';

describe('OpticalBillingComponent', () => {
  let component: OpticalBillingComponent;
  let fixture: ComponentFixture<OpticalBillingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpticalBillingComponent]
    });
    fixture = TestBed.createComponent(OpticalBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
