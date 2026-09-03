import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineStockListComponent } from './medicine-stock-list.component';

describe('MedicineStockListComponent', () => {
  let component: MedicineStockListComponent;
  let fixture: ComponentFixture<MedicineStockListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineStockListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineStockListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
