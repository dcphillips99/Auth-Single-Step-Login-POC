import { TestBed } from '@angular/core/testing';

import { AuthOService } from './auth.service';

describe('AuthOServiceService', () => {
  let service: AuthOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
