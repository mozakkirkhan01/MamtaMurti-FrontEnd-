import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingItemListTodayComponent } from './billing-item-list-today.component';

describe('BillingItemListTodayComponent', () => {
  let component: BillingItemListTodayComponent;
  let fixture: ComponentFixture<BillingItemListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillingItemListTodayComponent]
    });
    fixture = TestBed.createComponent(BillingItemListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
