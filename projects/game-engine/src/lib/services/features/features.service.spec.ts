import { TestBed } from '@angular/core/testing';
import { TickService } from '../tick/tick.service';

import { FeaturesService } from './features.service';

describe('DataService', () => {
  let service: FeaturesService;
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
    service = TestBed.inject(FeaturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
