import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeSummaryListComponent } from './discharge-summary-list.component';

describe('DischargeSummaryListComponent', () => {
  let component: DischargeSummaryListComponent;
  let fixture: ComponentFixture<DischargeSummaryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DischargeSummaryListComponent]
    });
    fixture = TestBed.createComponent(DischargeSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
