import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StoreService } from 'game-engine';

import { ResearchsGuard } from './researchs.guard';

describe('ResearchsGuard', () => {
  let guard: ResearchsGuard;
  let router: Router;
  let storeService: StoreService;

  beforeEach(() => {
    router = {} as any;
    storeService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: StoreService,
          useValue: storeService,
        },
      ]
    });
    guard = TestBed.inject(ResearchsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
