import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSaleReportComponent } from './medicine-sale-report.component';

describe('MedicineSaleReportComponent', () => {
  let component: MedicineSaleReportComponent;
  let fixture: ComponentFixture<MedicineSaleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineSaleReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSaleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
