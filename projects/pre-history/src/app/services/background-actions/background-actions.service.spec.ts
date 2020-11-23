import { TestBed } from '@angular/core/testing';

import { BackgroundActionsService } from './background-actions.service';

describe('BackgroundActionsService', () => {
  let service: BackgroundActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
