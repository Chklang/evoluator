import { TestBed } from '@angular/core/testing';
import { TickService } from '../tick/tick.service';

import { ResearchsService } from './researchs.service';

describe('DataService', () => {
  let service: ResearchsService;
  let tickService: TickService;

  beforeEach(() => {
    tickService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TickService,
          useValue: tickService,
        },
      ],
    });
    service = TestBed.inject(ResearchsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
