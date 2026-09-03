import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DosageComponent } from './dosage.component';

describe('DosageComponent', () => {
  let component: DosageComponent;
  let fixture: ComponentFixture<DosageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DosageComponent]
    });
    fixture = TestBed.createComponent(DosageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
