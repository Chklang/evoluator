import { TestBed } from '@angular/core/testing';
import { Dictionnary } from 'arrayplus';
import { IBuildingBlocker, IFeatureBlocker, IResourceBlocker } from '../../model/i-blocker';
import { of, Subject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { IBuilding, IGame, IGameContext } from '../../model';
import { AchievementsService } from '../achievements/achievements.service';
import { BuildingsService } from '../buildings/buildings.service';
import { ConfigService } from '../config/config.service';
import { FavoritesService } from '../favorites/favorites.service';
import { FeaturesService } from '../features/features.service';
import { PersistentService } from '../persistent/persistent.service';
import { ResearchsService } from '../researchs/researchs.service';
import { TickService } from '../tick/tick.service';

import { StoreService } from './store.service';
import { ModalService } from '../modal/modal.service';

interface TickServiceForTest {
  tick$: Subject<number>;
}

describe('StoreService', () => {
  let service: StoreService;
  let researchsService: ResearchsService;
  let featuresService: FeaturesService;
  let buildingsService: BuildingsService;
  let configService: ConfigService;
  let tickService: TickServiceForTest;
  let persistentService: PersistentService;
  let favoritesService: FavoritesService;
  let achievementsService: AchievementsService;
  let gameContext: IGameContext;
  let modalService: ModalService;

  function createEmptyGame(): IGame {
    return {
      achievements: {},
      buildings: {},
      buildingsMax: {},
      calculated: {
        nextEvent: 0,
        production: {},
        consumptionReal: {},
        productionReal: {},
      },
      favorites: [],
      researchs: {},
      researchsMax: {},
      resources: {},
      resourcesTotal: {},
      showableElements: {
        achievements: Dictionnary.create(),
        buildings: Dictionnary.create(),
        features: Dictionnary.create(),
        researchs: Dictionnary.create(),
        resources: Dictionnary.create(),
      },
      time: 0,
    };
  }

  beforeEach(() => {
    gameContext = {
      allAchievements: [],
      allBuildings: [],
      allFeatures: [],
      allResearchs: [],
      allResources: [],
      gameFromScratch: createEmptyGame(),
    };
    researchsService = {} as any;
    featuresService = {} as any;
    buildingsService = {
      setBuildingCount: () => { },
    } as any;
    configService = {
      config$: of(null),
    } as any;
    tickService = {
      tick$: new Subject(),
    };
    persistentService = {
      load: () => of(gameContext.gameFromScratch),
      save: (e) => of(e),
    } as any;
    favoritesService = {} as any;
    achievementsService = {} as any;
    modalService = {
      openModal: () => { },
    } as any;
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
        {
          provide: AchievementsService,
          useValue: achievementsService,
        },
        {
          provide: ModalService,
          useValue: modalService,
        },
      ],
    });
    service = TestBed.inject(StoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Check calculations', () => {
    it('When no consumption with only one resource (no self-grow but growType CLASSIC)', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
      });
      gameContext.allBuildings.push({
        name: 'woodProduced',
        cost: {},
        produce: {
          wood: 1,
        },
      });
      gameContext.gameFromScratch.buildings.woodProduced = 2;
      service.init(gameContext);
      service.start();
      // Send 10s
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 20,
            max: 100,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(20);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(2);
          // After 50secs wood must be full
          expect(datas.calculated.nextEvent).toBe(50_000);
        }),
        take(1),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });

    it('When no consumption with only one resource (no self-grow but growType EXPONENTIAL)', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        resourceType: 'CLASSIC',
        growType: 'EXPONENTIAL',
        min: 1,
      });
      gameContext.allBuildings.push({
        name: 'woodProduced',
        cost: {},
        produce: {
          wood: 0.01,
        },
      });
      gameContext.gameFromScratch.buildings.woodProduced = 2;
      service.init(gameContext);
      service.start();
      // Send 10s
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 1.2189944199947573,
            max: 100,
            min: 1,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBeGreaterThan(0.21899441999475);
          expect(datas.resourcesTotal.wood).toBeLessThan(0.21899441999476);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(1.02);
          // After 50secs wood must be full
          expect(datas.calculated.nextEvent).toBe(232553.4949029975);
        }),
        take(1),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });

    it('When no consumption with only one resource wich grow auto (classic)', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
        selfGrow: 2,
      });
      service.init(gameContext);
      service.start();
      // Send 10s
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 20,
            max: 100,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(20);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(2);
          // After 50secs wood must be full
          expect(datas.calculated.nextEvent).toBe(50_000);
        }),
        take(1),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });

    it('When no consumption with only one resource wich grow auto (exponential)', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        min: 1,
        resourceType: 'CLASSIC',
        growType: 'EXPONENTIAL',
        selfGrow: 1.01,
      });
      service.init(gameContext);
      service.start();
      // Send 10s
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 1.1046221254112045,
            max: 100,
            min: 1,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBeGreaterThan(0.10462212541120);
          expect(datas.resourcesTotal.wood).toBeLessThan(0.10462212541121);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(1.01);
          // After 50secs wood must be full
          expect(datas.calculated.nextEvent).toBe(462815.7851175219);
        }),
        take(1),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });

    it('When a resource is consumed', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100_000,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
      }, {
        name: 'charcoal',
        icon: '',
        max: 100_000,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
      });
      gameContext.allBuildings.push({
        name: 'furnace',
        cost: {},
        consume: {
          wood: 1,
        },
        produce: {
          charcoal: 3
        },
      });
      gameContext.gameFromScratch.buildings = {
        furnace: 1,
      };
      gameContext.gameFromScratch.resources = {
        wood: {
          icon: '', max: 100_000, min: 0, quantity: 100,
        },
      };

      service.init(gameContext);
      service.start();

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 90,
            max: 100_000,
            min: 0,
            icon: '',
          });
          expect(datas.resources.charcoal).toBeDefined();
          expect(datas.resources.charcoal).toEqual({
            quantity: 30,
            max: 100_000,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(0);
          expect(datas.resourcesTotal.charcoal).toBe(30);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(-1);
          expect(datas.calculated.production.charcoal).toBeDefined();
          expect(datas.calculated.production.charcoal).toBe(3);
          // After 150secs wood must be empty
          expect(datas.calculated.nextEvent).toBe(100_000);
          setTimeout(() => tickService.tick$.next(150 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(150_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 0,
            max: 100_000,
            min: 0,
            icon: '',
          });
          expect(datas.resources.charcoal).toBeDefined();
          expect(datas.resources.charcoal).toEqual({
            quantity: 300,
            max: 100_000,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(0);
          expect(datas.resourcesTotal.charcoal).toBe(300);
          expect(datas.calculated.production.wood).toBeUndefined();
          expect(datas.calculated.production.charcoal).toBeUndefined();
          // No production for eternity
          expect(datas.calculated.nextEvent).toBe(+Infinity);
        },
      ];

      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(2),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });

    it('When a resource is consumed and produced', (done) => {
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 300,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
      }, {
        name: 'charcoal',
        icon: '',
        max: 90,
        resourceType: 'CLASSIC',
        growType: 'CLASSIC',
      });
      gameContext.allBuildings.push({
        name: 'furnace',
        cost: {},
        consume: {
          wood: 1,
        },
        produce: {
          charcoal: 3
        },
      });
      gameContext.allBuildings.push({
        name: 'woodCutter',
        cost: {},
        produce: {
          wood: 1,
        },
      });
      gameContext.gameFromScratch.buildings = {
        furnace: 1,
        woodCutter: 2,
      };

      service.init(gameContext);
      service.start();

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 10,
            max: 300,
            min: 0,
            icon: '',
          });
          expect(datas.resources.charcoal).toBeDefined();
          expect(datas.resources.charcoal).toEqual({
            quantity: 30,
            max: 90,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(20);
          expect(datas.resourcesTotal.charcoal).toBe(30);
          expect(datas.calculated.production.wood).toBeDefined();
          expect(datas.calculated.production.wood).toBe(1);
          expect(datas.calculated.production.charcoal).toBeDefined();
          expect(datas.calculated.production.charcoal).toBe(3);
          // After 150secs wood must be empty
          expect(datas.calculated.nextEvent).toBe(30_000);
          setTimeout(() => tickService.tick$.next(150 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(150_000);
          expect(datas.resources.wood).toBeDefined();
          expect(datas.resources.wood).toEqual({
            quantity: 270,
            max: 300,
            min: 0,
            icon: '',
          });
          expect(datas.resources.charcoal).toBeDefined();
          expect(datas.resources.charcoal).toEqual({
            quantity: 90,
            max: 90,
            min: 0,
            icon: '',
          });
          expect(datas.resourcesTotal.wood).toBe(300);
          expect(datas.resourcesTotal.charcoal).toBe(90);
          expect(datas.calculated.production.wood).toBe(2);
          expect(datas.calculated.production.charcoal).toBeUndefined();
          // No production for eternity
          expect(datas.calculated.nextEvent).toBe(165_000);
        },
      ];

      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(2),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
  });

  describe('Check "blockedBy"', () => {
    beforeEach(() => {
      featuresService.setFeature = () => { };
    });
    it('Try a feature not blocked', (done) => {
      gameContext.allFeatures.push({
        name: 'MyFeature',
      });

      service.init(gameContext);
      service.start();
      // Send 10s
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(true);
          // No next event
          expect(datas.calculated.nextEvent).toBe(+Infinity);
        }),
        take(1),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
    it('Try a feature blocked by resourcesTotal', (done) => {
      gameContext.allFeatures.push({
        name: 'MyFeature',
        blockedBy: [
          {
            type: 'resourceTotal',
            params: {
              name: 'wood',
              quantity: 150,
            }
          } as IResourceBlocker
        ]
      });
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        resourceType: 'CLASSIC',
        selfGrow: 1,
        growType: 'CLASSIC',
      });
      const building: IBuilding = {
        name: 'MyBuilding',
        cost: {
          wood: 80
        },
      };
      gameContext.allBuildings.push(building);

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.resources.wood).toEqual({
            icon: '',
            max: 100,
            min: 0,
            quantity: 10,
          });
          expect(datas.resourcesTotal.wood).toBe(10);
          expect(datas.calculated.nextEvent).toBe(100_000);
          setTimeout(() => tickService.tick$.next(150 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(150_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.resources.wood).toEqual({
            icon: '',
            max: 100,
            min: 0,
            quantity: 100,
          });
          expect(datas.resourcesTotal.wood).toBe(100);
          expect(datas.calculated.nextEvent).toBe(+Infinity);
          service.build(building).toPromise();
        },
        (datas: IGame) => {
          expect(datas.time).toBe(150_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.resources.wood).toEqual({
            icon: '',
            max: 100,
            min: 0,
            quantity: 20,
          });
          expect(datas.resourcesTotal.wood).toBe(100);
          expect(datas.buildings.MyBuilding).toBe(1);
          expect(datas.calculated.nextEvent).toBe(0);
          setTimeout(() => tickService.tick$.next(210 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(210_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(true);
          expect(datas.resources.wood).toEqual({
            icon: '',
            max: 100,
            min: 0,
            quantity: 80,
          });
          expect(datas.resourcesTotal.wood).toBe(160);
          expect(datas.buildings.MyBuilding).toBe(1);
          expect(datas.calculated.nextEvent).toBe(230_000);
        },
      ];

      service.init(gameContext);
      service.start();
      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(4),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
    it('Try a feature blocked by resources', (done) => {
      gameContext.allFeatures.push({
        name: 'MyFeature',
        blockedBy: [
          {
            type: 'resource',
            params: {
              name: 'wood',
              quantity: 50,
            }
          } as IResourceBlocker
        ]
      });
      gameContext.allResources.push({
        name: 'wood',
        icon: '',
        max: 100,
        resourceType: 'CLASSIC',
        selfGrow: 1,
        growType: 'CLASSIC',
      });

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.calculated.nextEvent).toBe(100_000);
          setTimeout(() => tickService.tick$.next(60 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(60_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(true);
          expect(datas.calculated.nextEvent).toBe(100_000);
        },
      ];

      service.init(gameContext);
      service.start();
      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(2),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
    it('Try a feature blocked by building', (done) => {
      gameContext.allFeatures.push({
        name: 'MyFeature',
        blockedBy: [
          {
            type: 'building',
            params: {
              name: 'MyBuilding',
              quantity: 3,
            }
          } as IBuildingBlocker,
        ]
      });
      const building: IBuilding = {
        name: 'MyBuilding',
        cost: {}
      };
      gameContext.allBuildings.push(building);

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.calculated.nextEvent).toBe(+Infinity);
          return service.build(building).toPromise();
        },
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.calculated.nextEvent).toBe(0);
          expect(datas.buildings.MyBuilding).toBe(1);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          return service.build(building).toPromise();
        },
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.calculated.nextEvent).toBe(0);
          expect(datas.buildings.MyBuilding).toBe(2);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          setTimeout(() => tickService.tick$.next(20 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(20_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.buildings.MyBuilding).toBe(2);
          expect(datas.calculated.nextEvent).toBe(+Infinity);
          return service.build(building).toPromise();
        },
        (datas: IGame) => {
          expect(datas.time).toBe(20_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.buildings.MyBuilding).toBe(3);
          expect(datas.calculated.nextEvent).toBe(0);
          setTimeout(() => tickService.tick$.next(30 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(30_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(true);
          expect(datas.buildings.MyBuilding).toBe(3);
          expect(datas.calculated.nextEvent).toBe(+Infinity);
        },
      ];

      service.init(gameContext);
      service.start();
      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(6),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
    it('Try a feature blocked by feature', (done) => {
      featuresService.setFeature = () => { };
      gameContext.allFeatures.push({
        name: 'MyFeature',
        blockedBy: [
          {
            type: 'feature',
            params: {
              name: 'MyFeature2',
            }
          } as IFeatureBlocker,
        ]
      }, {
        name: 'MyFeature2',
        blockedBy: [
          {
            type: 'building',
            params: {
              name: 'MyBuilding',
              quantity: 1,
            }
          } as IBuildingBlocker,
        ]
      });
      const building: IBuilding = {
        name: 'MyBuilding',
        cost: {}
      };
      gameContext.allBuildings.push(building);

      const checkDatas = [
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.showableElements.features.hasElement('MyFeature2')).toBe(false);
          expect(datas.buildings.MyBuilding).toBeUndefined();
          expect(datas.calculated.nextEvent).toBe(+Infinity);
          return service.build(building).toPromise();
        },
        (datas: IGame) => {
          expect(datas.time).toBe(10_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(false);
          expect(datas.showableElements.features.hasElement('MyFeature2')).toBe(false);
          expect(datas.buildings.MyBuilding).toBe(1);
          expect(datas.calculated.nextEvent).toBe(0);
          setTimeout(() => tickService.tick$.next(20 * 1000));
        },
        (datas: IGame) => {
          expect(datas.time).toBe(20_000);
          expect(datas.showableElements.features.hasElement('MyFeature')).toBe(true);
          expect(datas.showableElements.features.hasElement('MyFeature2')).toBe(true);
          expect(datas.buildings.MyBuilding).toBe(1);
          expect(datas.calculated.nextEvent).toBe(+Infinity);
        },
      ];

      service.init(gameContext);
      service.start();
      // Send 10s
      let currentCallIndex = 0;
      service.datas$.pipe(
        filter((datas) => datas.time > 0),
        tap((datas) => {
          checkDatas[currentCallIndex](datas);
          currentCallIndex++;
        }),
        take(3),
      ).subscribe({
        complete: done,
        error: done.fail,
      });
      tickService.tick$.next(10 * 1000);
    });
  });
});
