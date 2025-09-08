import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentFormComponent } from './consent-form.component';

describe('ConsentFormComponent', () => {
  let component: ConsentFormComponent;
  let fixture: ComponentFixture<ConsentFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsentFormComponent]
    });
    fixture = TestBed.createComponent(ConsentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
