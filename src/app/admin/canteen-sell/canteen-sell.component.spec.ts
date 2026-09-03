import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanteenSellComponent } from './canteen-sell.component';

describe('CanteenSellComponent', () => {
  let component: CanteenSellComponent;
  let fixture: ComponentFixture<CanteenSellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CanteenSellComponent]
    });
    fixture = TestBed.createComponent(CanteenSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
