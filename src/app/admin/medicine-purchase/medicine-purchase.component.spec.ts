import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicinePurchaseComponent } from './medicine-purchase.component';

describe('MedicinePurchaseComponent', () => {
  let component: MedicinePurchaseComponent;
  let fixture: ComponentFixture<MedicinePurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicinePurchaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicinePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
