import { TestBed } from '@angular/core/testing';
import { FeaturesService } from '../features/features.service';
import { ResearchsService } from '../researchs/researchs.service';

import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;
  let researchsService: ResearchsService;
  let featuresService: FeaturesService;

  beforeEach(() => {
    researchsService = {} as any;
    featuresService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResearchsService,
          useValue: researchsService,
        },
        {
          provide: FeaturesService,
          useValue: featuresService,
        },
      ]
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
