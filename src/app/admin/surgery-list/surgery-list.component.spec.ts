import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryListComponent } from './surgery-list.component';

describe('SurgeryListComponent', () => {
  let component: SurgeryListComponent;
  let fixture: ComponentFixture<SurgeryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurgeryListComponent]
    });
    fixture = TestBed.createComponent(SurgeryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
