import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FeaturesService } from 'game-engine';

import { ResearchsGuard } from './researchs.guard';

describe('ResearchsGuard', () => {
  let guard: ResearchsGuard;
  let router: Router;
  let featuresService: FeaturesService;

  beforeEach(() => {
    router = {} as any;
    featuresService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: FeaturesService,
          useValue: featuresService,
        },
      ]
    });
    guard = TestBed.inject(ResearchsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
