import { TestBed } from '@angular/core/testing';
import { BuildingsService } from '../buildings/buildings.service';
import { ResearchsService } from '../researchs/researchs.service';

import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let buildingsService: BuildingsService;
  let researchsService: ResearchsService;

  beforeEach(() => {
    buildingsService = {} as any;
    researchsService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BuildingsService,
          useValue: buildingsService,
        },
        {
          provide: ResearchsService,
          useValue: researchsService,
        },
      ],
    });
    service = TestBed.inject(FavoritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
