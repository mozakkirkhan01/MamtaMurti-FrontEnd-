import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineReturnComponent } from './medicine-return.component';

describe('MedicineReturnComponent', () => {
  let component: MedicineReturnComponent;
  let fixture: ComponentFixture<MedicineReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineReturnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
