import { TestBed } from '@angular/core/testing';
import { BuildingsService } from '../buildings/buildings.service';
import { FeaturesService } from '../features/features.service';
import { ResearchsService } from '../researchs/researchs.service';

import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;
  let researchsService: ResearchsService;
  let featuresService: FeaturesService;
  let buildingsService: BuildingsService;

  beforeEach(() => {
    researchsService = {} as any;
    featuresService = {} as any;
    buildingsService = {} as any;
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
        {
          provide: BuildingsService,
          useValue: buildingsService,
        },
      ]
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
