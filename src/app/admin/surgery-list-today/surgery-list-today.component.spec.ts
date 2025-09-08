import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryListTodayComponent } from './surgery-list-today.component';

describe('SurgeryListTodayComponent', () => {
  let component: SurgeryListTodayComponent;
  let fixture: ComponentFixture<SurgeryListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurgeryListTodayComponent]
    });
    fixture = TestBed.createComponent(SurgeryListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
