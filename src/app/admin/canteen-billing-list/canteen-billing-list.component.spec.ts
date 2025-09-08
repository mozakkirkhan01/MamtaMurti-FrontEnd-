import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanteenBillingListComponent } from './canteen-billing-list.component';

describe('CanteenBillingListComponent', () => {
  let component: CanteenBillingListComponent;
  let fixture: ComponentFixture<CanteenBillingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanteenBillingListComponent]
    });
    fixture = TestBed.createComponent(CanteenBillingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
