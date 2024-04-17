import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePickerFormFieldComponent } from './time-picker-form-field.component';

describe('TimePickerFormFieldComponent', () => {
  let component: TimePickerFormFieldComponent;
  let fixture: ComponentFixture<TimePickerFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerFormFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimePickerFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
