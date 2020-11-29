import { TestBed } from '@angular/core/testing';
import { BuildingsService } from '../buildings/buildings.service';
import { ConfigService } from '../config/config.service';
import { FeaturesService } from '../features/features.service';
import { ResearchsService } from '../researchs/researchs.service';
import { TickService } from '../tick/tick.service';

import { StoreService } from './store.service';

describe('StoreService', () => {
  let service: StoreService;
  let researchsService: ResearchsService;
  let featuresService: FeaturesService;
  let buildingsService: BuildingsService;
  let configService: ConfigService;
  let tickService: TickService;

  beforeEach(() => {
    researchsService = {} as any;
    featuresService = {} as any;
    buildingsService = {} as any;
    configService = {} as any;
    tickService = {} as any;
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
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: TickService,
          useValue: tickService,
        },
      ],
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
