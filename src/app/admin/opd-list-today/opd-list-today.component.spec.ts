import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdListTodayComponent } from './opd-list-today.component';

describe('OpdListTodayComponent', () => {
  let component: OpdListTodayComponent;
  let fixture: ComponentFixture<OpdListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpdListTodayComponent]
    });
    fixture = TestBed.createComponent(OpdListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
