import { TestBed } from '@angular/core/testing';

import { FormioConfigService } from './formio-config.service';

describe('FormioConfigService', () => {
  let service: FormioConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormioConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
