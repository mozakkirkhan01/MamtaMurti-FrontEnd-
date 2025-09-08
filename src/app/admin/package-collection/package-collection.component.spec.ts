import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageCollectionComponent } from './package-collection.component';

describe('PackageCollectionComponent', () => {
  let component: PackageCollectionComponent;
  let fixture: ComponentFixture<PackageCollectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageCollectionComponent]
    });
    fixture = TestBed.createComponent(PackageCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
