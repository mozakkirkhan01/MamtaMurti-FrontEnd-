import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpticalBillingListComponent } from './optical-billing-list.component';

describe('OpticalBillingListComponent', () => {
  let component: OpticalBillingListComponent;
  let fixture: ComponentFixture<OpticalBillingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpticalBillingListComponent]
    });
    fixture = TestBed.createComponent(OpticalBillingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
