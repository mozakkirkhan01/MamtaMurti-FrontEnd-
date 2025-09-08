import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinePurchaseReportComponent } from './medicine-purchase-report.component';

describe('MedicinePurchaseReportComponent', () => {
  let component: MedicinePurchaseReportComponent;
  let fixture: ComponentFixture<MedicinePurchaseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicinePurchaseReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinePurchaseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
