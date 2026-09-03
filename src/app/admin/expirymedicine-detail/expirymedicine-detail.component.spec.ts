import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpirymedicineDetailComponent } from './expirymedicine-detail.component';

describe('ExpirymedicineDetailComponent', () => {
  let component: ExpirymedicineDetailComponent;
  let fixture: ComponentFixture<ExpirymedicineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpirymedicineDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpirymedicineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
