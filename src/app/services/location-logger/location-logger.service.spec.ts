import { TestBed } from '@angular/core/testing';

import { LocationLoggerService } from './location-logger.service';

describe('LocationLoggerService', () => {
  let service: LocationLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
