import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimePickerFormFieldComponent } from './datetime-picker-form-field.component';

describe('DatetimePickerFormFieldComponent', () => {
  let component: DatetimePickerFormFieldComponent;
  let fixture: ComponentFixture<DatetimePickerFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatetimePickerFormFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatetimePickerFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
