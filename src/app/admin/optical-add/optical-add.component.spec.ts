import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpticalAddComponent } from './optical-add.component';

describe('OpticalAddComponent', () => {
  let component: OpticalAddComponent;
  let fixture: ComponentFixture<OpticalAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpticalAddComponent]
    });
    fixture = TestBed.createComponent(OpticalAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
