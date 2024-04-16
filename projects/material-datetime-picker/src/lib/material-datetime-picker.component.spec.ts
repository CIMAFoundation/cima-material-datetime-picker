import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDatetimePickerComponent } from './material-datetime-picker.component';

describe('MaterialDatetimePickerComponent', () => {
  let component: MaterialDatetimePickerComponent;
  let fixture: ComponentFixture<MaterialDatetimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialDatetimePickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaterialDatetimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
