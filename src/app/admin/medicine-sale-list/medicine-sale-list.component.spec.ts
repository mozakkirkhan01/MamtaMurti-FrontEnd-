import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineSaleListComponent } from './medicine-sale-list.component';

describe('MedicineSaleListComponent', () => {
  let component: MedicineSaleListComponent;
  let fixture: ComponentFixture<MedicineSaleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicineSaleListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineSaleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
