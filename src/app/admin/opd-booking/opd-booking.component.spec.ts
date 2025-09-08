import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdBookingComponent } from './opd-booking.component';

describe('OpdBookingComponent', () => {
  let component: OpdBookingComponent;
  let fixture: ComponentFixture<OpdBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpdBookingComponent]
    });
    fixture = TestBed.createComponent(OpdBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
