import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpticalBillingListTodayComponent } from './optical-billing-list-today.component';

describe('OpticalBillingListTodayComponent', () => {
  let component: OpticalBillingListTodayComponent;
  let fixture: ComponentFixture<OpticalBillingListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpticalBillingListTodayComponent]
    });
    fixture = TestBed.createComponent(OpticalBillingListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
