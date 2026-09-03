import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingItemListComponent } from './billing-item-list.component';

describe('BillingItemListComponent', () => {
  let component: BillingItemListComponent;
  let fixture: ComponentFixture<BillingItemListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillingItemListComponent]
    });
    fixture = TestBed.createComponent(BillingItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
