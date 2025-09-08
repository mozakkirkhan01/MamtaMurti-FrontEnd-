import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageBillComponent } from './package-bill.component';

describe('PackageBillComponent', () => {
  let component: PackageBillComponent;
  let fixture: ComponentFixture<PackageBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageBillComponent]
    });
    fixture = TestBed.createComponent(PackageBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
