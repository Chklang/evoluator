import { TestBed } from '@angular/core/testing';

import { ResearchsService } from './researchs.service';

describe('DataService', () => {
  let service: ResearchsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearchsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
