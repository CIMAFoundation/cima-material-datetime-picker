import { TestBed } from '@angular/core/testing';

import { MaterialDatetimePickerService } from './material-datetime-picker.service';

describe('MaterialDatetimePickerService', () => {
  let service: MaterialDatetimePickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialDatetimePickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
