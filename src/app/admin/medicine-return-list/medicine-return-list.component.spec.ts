import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineReturnListComponent } from './medicine-return-list.component';

describe('MedicineReturnListComponent', () => {
  let component: MedicineReturnListComponent;
  let fixture: ComponentFixture<MedicineReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineReturnListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
