import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryPackageComponent } from './surgery-package.component';

describe('PackageDetialComponent', () => {
  let component: SurgeryPackageComponent;
  let fixture: ComponentFixture<SurgeryPackageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SurgeryPackageComponent]
    });
    fixture = TestBed.createComponent(SurgeryPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
