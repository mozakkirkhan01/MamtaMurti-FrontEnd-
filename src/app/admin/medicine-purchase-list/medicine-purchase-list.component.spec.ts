import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinePurchaseListComponent } from './medicine-purchase-list.component';

describe('MedicinePurchaseListComponent', () => {
  let component: MedicinePurchaseListComponent;
  let fixture: ComponentFixture<MedicinePurchaseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicinePurchaseListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinePurchaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
