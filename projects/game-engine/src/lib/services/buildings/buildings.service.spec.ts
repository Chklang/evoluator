import { TestBed } from '@angular/core/testing';
import { TickService } from '../tick/tick.service';

import { BuildingsService } from './buildings.service';

describe('BuildingsService', () => {
  let service: BuildingsService;
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
    service = TestBed.inject(BuildingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
