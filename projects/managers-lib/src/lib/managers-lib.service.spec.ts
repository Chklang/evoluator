import { TestBed } from '@angular/core/testing';

import { ManagersLibService } from './managers-lib.service';

describe('ManagersLibService', () => {
  let service: ManagersLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagersLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
