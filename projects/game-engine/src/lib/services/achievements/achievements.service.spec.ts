import { TestBed } from '@angular/core/testing';
import { TickService } from '../tick/tick.service';

import { AchievementsService } from './achievements.service';

describe('AchievementsService', () => {
  let service: AchievementsService;
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
    service = TestBed.inject(AchievementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
