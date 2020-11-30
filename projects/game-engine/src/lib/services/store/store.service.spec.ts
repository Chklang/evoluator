import { TestBed } from '@angular/core/testing';
import { BuildingsService } from '../buildings/buildings.service';
import { ConfigService } from '../config/config.service';
import { FavoritesService } from '../favorites/favorites.service';
import { FeaturesService } from '../features/features.service';
import { PersistentService } from '../persistent/persistent.service';
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
  let persistentService: PersistentService;
  let favoritesService: FavoritesService;

  beforeEach(() => {
    researchsService = {} as any;
    featuresService = {} as any;
    buildingsService = {} as any;
    configService = {} as any;
    tickService = {} as any;
    persistentService = {} as any;
    favoritesService = {} as any;
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
        {
          provide: PersistentService,
          useValue: persistentService,
        },
        {
          provide: FavoritesService,
          useValue: favoritesService,
        },
      ],
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
