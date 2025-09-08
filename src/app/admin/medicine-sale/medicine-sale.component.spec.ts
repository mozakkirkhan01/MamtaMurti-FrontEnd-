import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSaleComponent } from './medicine-sale.component';

describe('MedicineSaleComponent', () => {
  let component: MedicineSaleComponent;
  let fixture: ComponentFixture<MedicineSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineSaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
