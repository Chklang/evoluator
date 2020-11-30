import { Injectable } from '@angular/core';
import { from, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, finalize, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import {
  IGame,
  IBlocker,
  IResource,
  IGameContext,
  IBuilding,
  createDictionnaryBuilding,
  createDictionnaryResource,
  IResourceBlocker,
  IChainedUnlock,
  createDictionnaryFeature,
  IFeature,
  IResearch,
  createDictionnaryResearch,
  IConfig
} from '../../model';
import { BuildingsService } from '../buildings/buildings.service';
import { ConfigService } from '../config/config.service';
import { EFavoriteType, FavoritesService } from '../favorites/favorites.service';
import { FeaturesService } from '../features/features.service';
import { PersistentService } from '../persistent/persistent.service';
import { ResearchsService } from '../researchs/researchs.service';
import { TickService } from '../tick/tick.service';
import { ICalculatedGameContext } from './i-calculated-game-context';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  public readonly datas$: Subject<IGame> = new ReplaySubject(1);
  private started = false;
  private nextLock: Promise<void> = Promise.resolve();

  private gameContext$: Subject<ICalculatedGameContext> = new ReplaySubject(1);
  private resourcesByKey: Record<string, IResource> = {};

  constructor(
    private researchsService: ResearchsService,
    private featuresService: FeaturesService,
    private buildingsService: BuildingsService,
    private configService: ConfigService,
    private tickService: TickService,
    private persistentService: PersistentService,
    private favoritesService: FavoritesService,
  ) {
    this.gameContext$.pipe(
      tap((context) => {
        context.allResources.forEach((resource) => {
          this.resourcesByKey[resource.name] = resource;
          resource.growType = resource.growType || 'CLASSIC';
          resource.consumeType = resource.consumeType || 'FOR_PRODUCTION';
          resource.selfGrow = this.defaultValue(resource.selfGrow, 1);
        });
      }),
      switchMap((context) => {
        return this.persistentService.load(context).pipe(
          switchMap((gameLoaded) => {
            this.datas$.next(this.initShowableElements(context, gameLoaded));
            return this.persistentService.save(gameLoaded);
          }),
          switchMap((gameLoaded) => {
            return this.tickService.tick$.pipe(
              filter(() => this.started),
              switchMap(() => this.lock((oldDatas) => {
                const datas: IGame = this.cloneDatas(oldDatas);
                this.updateGame(datas, context);
                this.datas$.next(datas);
              })),
            );
          }),
        );
      }),
    ).subscribe();
  }

  private cloneDatas(oldGame: IGame): IGame {
    const datas: IGame = JSON.parse(JSON.stringify(oldGame));
    datas.calculated.nextEvent = oldGame.calculated.nextEvent;
    datas.showableElements = oldGame.showableElements;
    return datas;
  }

  public init(context: IGameContext): void {
    this.gameContext$.next({
      allBuildings: createDictionnaryBuilding(context.allBuildings),
      allFeatures: createDictionnaryFeature(context.allFeatures),
      allResources: createDictionnaryResource(context.allResources),
      allResearchs: createDictionnaryResearch(context.allResearchs),
      gameFromScratch: context.gameFromScratch,
    });
  }

  public start(): void {
    this.started = true;
  }
  public stop(): void {
    this.started = false;
  }

  private initShowableElements(gameContext: ICalculatedGameContext, datas: IGame): IGame {
    gameContext.allBuildings.filter((building) => Object.keys(building.blockedBy).every((key) => {
      return false;
    })).forEach((building) => {
      datas.showableElements.buildings.addElement(building.name, building);
    });
    datas.showableElements.buildings.forEach((building => {
      this.buildingsService.setBuildingCount(gameContext, building, datas.buildings[building.name] || 0, [], 0, datas);
    }));

    gameContext.allResources.filter((resource) => Object.keys(resource.blockedBy).every((key) => {
      return false;
    })).forEach((resource) => {
      datas.showableElements.resources.addElement(resource.name, resource);
    });

    gameContext.allFeatures.filter((feature) => Object.keys(feature.blockedBy).every((key) => {
      return false;
    })).forEach((feature) => {
      datas.showableElements.features.addElement(feature.name, feature);
    });
    datas.showableElements.features.forEach((feature => {
      this.featuresService.setFeature(gameContext, feature, [], 0);
    }));

    gameContext.allResearchs.filter((research) => Object.keys(research.blockedBy || {}).every((key) => {
      return false;
    })).forEach((research) => {
      datas.showableElements.researchs.addElement(research.name, research);
    });
    datas.showableElements.researchs.forEach((research => {
      this.researchsService.setResearchLevel(gameContext, research, datas.researchs[research.name] || 0, [], 0, datas);
    }));
    datas.favorites.forEach((favorite) => {
      switch (favorite.type) {
        case EFavoriteType.BUILDING:
          this.favoritesService.addBuildingInFavorites(gameContext.allBuildings.getElement(favorite.name));
          break;
        case EFavoriteType.RESEARCH:
          this.favoritesService.addResearchInFavorites(gameContext.allResearchs.getElement(favorite.name));
          break;
      }
    });
    return datas;
  }

  private updateGame(game: IGame, gameContext: ICalculatedGameContext): void {
    const now = Date.now();
    while (game.calculated.nextEvent < now) {
      this.updateUntilEvent(game, game.calculated.nextEvent);
      this.calculateNextEvent(game, gameContext);
    }
    this.updateUntilEvent(game, now);
  }

  private updateUntilEvent(game: IGame, now: number): void {
    const calculateUnitil = Math.min(now, game.calculated.nextEvent);
    const diff = (calculateUnitil - game.time) / 1000;
    if (diff <= 0) {
      return;
    }
    Object.keys(game.calculated.production).forEach((resource) => {
      switch (this.resourcesByKey[resource].growType) {
        case 'EXPONENTIAL':
          game.resources[resource].quantity = Math.min(
            game.resources[resource].max,
            (game.resources[resource].quantity * Math.pow(game.calculated.production[resource], diff) + Number.EPSILON)
          );
          break;
        case 'CLASSIC':
        default:
          game.resources[resource].quantity = Math.min(
            game.resources[resource].max,
            (game.resources[resource].quantity + (game.calculated.production[resource] * diff) + Number.EPSILON)
          );
          break;
      }
    });
    while (game.calculated.unlockFeature && game.calculated.unlockFeature.time < now) {
      game.showableElements.features.addElement(game.calculated.unlockFeature.element.name, game.calculated.unlockFeature.element);
      game.calculated.unlockFeature = game.calculated.unlockFeature.nextUnlock;
    }
    while (game.calculated.unlockResearch && game.calculated.unlockResearch.time < now) {
      game.showableElements.researchs.addElement(game.calculated.unlockResearch.element.name, game.calculated.unlockResearch.element);
      game.calculated.unlockResearch = game.calculated.unlockResearch.nextUnlock;
    }
    while (game.calculated.unlockBuilding && game.calculated.unlockBuilding.time < now) {
      game.showableElements.buildings.addElement(game.calculated.unlockBuilding.element.name, game.calculated.unlockBuilding.element);
      game.calculated.unlockBuilding = game.calculated.unlockBuilding.nextUnlock;
    }
    game.time = now;
  }

  private defaultValue<T>(value: T | undefined, defaultValue: T): T {
    if (value === undefined) {
      return defaultValue;
    }
    return value;
  }

  private minOrDefaultValue(valueRef: number | undefined, otherValue: number): number {
    if (valueRef === undefined) {
      return otherValue;
    }
    return Math.min(valueRef, otherValue);
  }

  private calculateNextEvent(game: IGame, gameContext: ICalculatedGameContext): void {
    let consumtion: Record<string, number>;
    let production: Record<string, number>;
    const percentConsumtion: Record<string, number> = {};
    const percentProduction: Record<string, number> = {};
    const bonusConsumtion: Record<string, number> = {};
    const bonusProduction: Record<string, number> = {};
    let problemProductionDetected = false;
    gameContext.allResources.forEach((resource) => {
      if (!game.resources[resource.name]) {
        game.resources[resource.name] = {
          quantity: 0,
          max: resource.max,
          icon: resource.icon,
        };
      } else {
        game.resources[resource.name].max = resource.max;
      }
    });
    Object.keys(game.researchs).forEach((researchName) => {
      const level = game.researchs[researchName];
      const research = gameContext.allResearchs.find((e) => e.name === researchName);
      if (!research) {
        console.log('Error : Reseach ' + researchName + ' is unknown!');
        return;
      }
      Object.keys(research.bonusResources).forEach((bonusResourceName) => {
        const bonusValue = research.bonusResources[bonusResourceName];
        if (bonusValue > 0) {
          bonusProduction[bonusResourceName] = this.defaultValue(bonusProduction[bonusResourceName], 1) * Math.pow(bonusValue, level);
        } else if (bonusValue < 0) {
          bonusConsumtion[bonusResourceName] = this.defaultValue(bonusConsumtion[bonusResourceName], 1) * Math.pow(bonusValue, level);
        }
      });
    });
    gameContext.allBuildings
      .filter((building) => !!game.buildings[building.name])
      .forEach((building) => {
        Object.keys(building.storage).forEach((resource) => {
          game.resources[resource].max += building.storage[resource] * game.buildings[building.name];
        });
      });
    do {
      consumtion = {};
      production = {};
      game.showableElements.resources.forEach((resource) => {
        if (resource.selfGrow !== undefined) {
          if (resource.selfGrow! > 0) {
            production[resource.name] = resource.selfGrow! * this.defaultValue(percentProduction[resource.name], 1);
          } else if (resource.selfGrow! < 0) {
            consumtion[resource.name] = resource.selfGrow! * this.defaultValue(percentConsumtion[resource.name], 1);
          }
        }
      });
      gameContext.allBuildings
        .filter((building) => !!game.buildings[building.name])
        .forEach((building) => {
          let buildingProduction;
          Object.keys(building.consume).forEach((consume) => {
            if (percentConsumtion[consume] !== undefined) {
              buildingProduction = this.minOrDefaultValue(buildingProduction, percentConsumtion[consume]);
            }
          });
          Object.keys(building.produce).forEach((produce) => {
            if (percentProduction[produce] !== undefined) {
              buildingProduction = this.minOrDefaultValue(buildingProduction, percentProduction[produce]);
            }
          });
          buildingProduction = this.defaultValue(buildingProduction, 1);
          Object.keys(building.consume).forEach((consume) => {
            if (consumtion[consume]) {
              consumtion[consume] += building.consume[consume] * buildingProduction * game.buildings[building.name];
            } else {
              consumtion[consume] = building.consume[consume] * buildingProduction * game.buildings[building.name];
            }
          });
          Object.keys(building.produce).forEach((produce) => {
            if (production[produce]) {
              production[produce] += building.produce[produce] * buildingProduction * game.buildings[building.name];
            } else {
              production[produce] = building.produce[produce] * buildingProduction * game.buildings[building.name];
            }
          });
        });
      // Apply bonus production/consumption
      Object.keys(bonusProduction).forEach((resourceName) => {
        if (production[resourceName]) {
          production[resourceName] *= bonusProduction[resourceName];
        }
      });
      Object.keys(bonusConsumtion).forEach((resourceName) => {
        if (consumtion[resourceName]) {
          consumtion[resourceName] *= bonusConsumtion[resourceName];
        }
      });
      problemProductionDetected = false;
      Object.keys(consumtion).forEach((consume) => {
        let newProduction: number;
        if (game.resources[consume].quantity > 0) {
          // Some quantities are in stock
          // So not decrease production percent
          return;
        }
        // If here, so stocks are empty
        if (!production[consume]) {
          // No production, full consumption => So stop all consumptions
          newProduction = 0;
        } else {
          // Some production, so reduce consumption to correspond to production
          const percent = production[consume] / consumtion[consume];
          if (percentConsumtion[consume] === undefined) {
            newProduction = percent;
          } else {
            newProduction = Math.min(percentConsumtion[consume], percent);
          }
        }
        if (newProduction !== percentConsumtion[consume]) {
          problemProductionDetected = true;
          percentConsumtion[consume] = newProduction;
        }
      });
      Object.keys(production).forEach((produce) => {
        let newProduction: number;
        if (game.resources[produce].quantity < game.resources[produce].max) {
          // Stocks are not full
          // So not decrease production percent
          return;
        }
        // If here, so stocks are full
        if (!consumtion[produce]) {
          // No consumption, so stop production
          newProduction = 0;
        } else {
          // Some consumption, so reduce production to correspond to consumption
          const percent = consumtion[produce] / production[produce];
          if (percentProduction[produce] === undefined) {
            newProduction = percent;
          } else {
            newProduction = Math.min(percentProduction[produce], percent);
          }
        }
        if (newProduction !== percentProduction[produce]) {
          problemProductionDetected = true;
          percentProduction[produce] = newProduction;
        }
      });
    } while (problemProductionDetected);
    game.calculated = {
      nextEvent: 0,
      production: {},
    };
    let nextEmptyOrFullStorage = +Infinity;
    // Calculate moment of next event for each resource
    gameContext.allResources.forEach((resource) => {
      if (consumtion[resource.name] || production[resource.name]) {
        const productionBySec = (production[resource.name] || 0) - (consumtion[resource.name] || 0);
        game.calculated.production[resource.name] = productionBySec;
        switch (resource.growType) {
          case 'EXPONENTIAL':
            if (productionBySec > 0) {
              nextEmptyOrFullStorage = Math.min(
                nextEmptyOrFullStorage,
                Math.log(game.resources[resource.name].max / game.resources[resource.name].quantity) / Math.log(productionBySec)
              );
            } else if (productionBySec < 0) {
              if (game.resources[resource.name].quantity <= 0) {
                nextEmptyOrFullStorage = 0;
              } else {
                nextEmptyOrFullStorage = Math.min(0,
                  Math.log(0.0001) / Math.log(productionBySec)
                );
              }
            }
            break;
          case 'CLASSIC':
          default:
            if (productionBySec > 0) {
              nextEmptyOrFullStorage = Math.min(
                nextEmptyOrFullStorage,
                (game.resources[resource.name].max - game.resources[resource.name].quantity) / productionBySec
              );
            } else if (productionBySec < 0) {
              if (game.resources[resource.name].quantity <= 0) {
                nextEmptyOrFullStorage = 0;
              } else {
                nextEmptyOrFullStorage = Math.min(0, game.resources[resource.name].quantity / productionBySec);
              }
            }
            break;
        }
      }
    });

    // Calculate moment of next event for unlock each feature
    this.updateAllFeatures(game, gameContext);
    // Calculate moment of next event for unlock each research
    this.updateAllResearchs(game, gameContext);
    // Calculate moment of next event for unlock each building
    this.updateAllBuildings(game, gameContext);

    game.calculated.nextEvent = game.time + Math.max(1, nextEmptyOrFullStorage * 1000);
  }

  private updateAllFeatures(game: IGame, gameContext: ICalculatedGameContext): void {
    const featureToUnlock: IChainedUnlock<IFeature>[] = [];
    gameContext.allFeatures.forEach((feature) => {
      if (game.showableElements.features.hasElement(feature.name)) {
        // Already unlocked
        return;
      }
      const blockedUntil = this.blockedUntil(game, gameContext, feature.blockedBy || []);
      const timeBlocked = game.time + (blockedUntil.time * 1000);
      this.featuresService.setFeature(gameContext, feature, blockedUntil.blockers, timeBlocked);
      featureToUnlock.push({
        element: feature,
        time: timeBlocked,
      });
    });
    featureToUnlock.sort((a, b) => a.time - b.time);
    game.calculated.unlockFeature = featureToUnlock.reduce((previous, current) => {
      if (!previous) {
        return current;
      }
      previous.nextUnlock = current;
      return current;
    }, undefined);
  }

  private updateAllResearchs(game: IGame, gameContext: ICalculatedGameContext): void {
    const researchToUnlock: IChainedUnlock<IResearch>[] = [];
    gameContext.allResearchs.forEach((research) => {
      if (game.showableElements.researchs.hasElement(research.name)) {
        // Already unlocked
        const count = game.researchs[research.name] || 0;
        this.researchsService.setResearchLevel(gameContext, research, count, [], 0, game);
        return;
      }
      const blockedUntil = this.blockedUntil(game, gameContext, research.blockedBy || []);
      const timeBlocked = game.time + (blockedUntil.time * 1000);
      this.researchsService.setResearchLevel(gameContext, research, 0, blockedUntil.blockers, timeBlocked, game);
      researchToUnlock.push({
        element: research,
        time: timeBlocked,
      });
    });
    researchToUnlock.sort((a, b) => a.time - b.time);
    game.calculated.unlockResearch = researchToUnlock.reduce((previous, current) => {
      if (!previous) {
        return current;
      }
      previous.nextUnlock = current;
      return current;
    }, undefined);
  }

  private updateAllBuildings(game: IGame, gameContext: ICalculatedGameContext): void {
    const buildingsToUnlock: IChainedUnlock<IBuilding>[] = [];
    gameContext.allBuildings.forEach((building) => {
      if (game.showableElements.buildings.hasElement(building.name)) {
        // Already unlocked
        const count = game.buildings[building.name] || 0;
        this.buildingsService.setBuildingCount(gameContext, building, count, [], 0, game);
        return;
      }
      const blockedUntil = this.blockedUntil(game, gameContext, building.blockedBy || []);
      const timeBlocked = game.time + (blockedUntil.time * 1000);
      this.buildingsService.setBuildingCount(gameContext, building, 0, blockedUntil.blockers, timeBlocked, game);
      buildingsToUnlock.push({
        element: building,
        time: timeBlocked,
      });
    });
    buildingsToUnlock.sort((a, b) => a.time - b.time);
    game.calculated.unlockBuilding = buildingsToUnlock.reduce((previous, current) => {
      if (!previous) {
        return current;
      }
      previous.nextUnlock = current;
      return current;
    }, undefined);
  }

  private blockedUntil(
    game: IGame,
    gameContext: ICalculatedGameContext,
    blockers: IBlocker<any>[]
  ): { time: number, blockers: IBlocker<any>[] } {
    const blockersActual = blockers.filter((blocker) => {
      switch (blocker.type) {
        case 'building':
          return true;
        case 'feature':
          return true;
        case 'resource': {
          const typedBlocker = blocker as IResourceBlocker;
          if (!game.resources[typedBlocker.params.name]) {
            // Resource stocks are empty
            return true;
          }
          if (game.resources[typedBlocker.params.name].quantity < typedBlocker.params.quantity) {
            return true;
          }
          return false;
        }
      }
    });
    const times = blockersActual.map((blocker) => {
      switch (blocker.type) {
        case 'building':
          return 0;
        case 'feature':
          return 0;
        case 'resource': {
          const typedBlocker = blocker as IResourceBlocker;
          if (!game.calculated.production[typedBlocker.params.name] || game.calculated.production[typedBlocker.params.name] < 0) {
            // Resource stocks not grow up, it will never produce sufficient quantity
            return +Infinity;
          }
          const currentQuantity = game.resources[typedBlocker.params.name]?.quantity || 0;
          switch (gameContext.allResources.getElement(typedBlocker.params.name).growType) {
            case 'CLASSIC':
              const missing = typedBlocker.params.quantity - currentQuantity;
              return missing / game.calculated.production[typedBlocker.params.name];
            case 'EXPONENTIAL':
              if (currentQuantity === 0) {
                return +Infinity;
              }
              return Math.log(typedBlocker.params.quantity / currentQuantity) /
                Math.log(game.calculated.production[typedBlocker.params.name]);
          }
        }
      }
    });
    if (times.length === 0) {
      return { time: 0, blockers: [] };
    }
    return { time: times.reduce((previous, current) => Math.min(previous, current), +Infinity), blockers: blockersActual };
  }

  public build(building: IBuilding): Observable<void> {
    return this.lock((oldDatas, gameContext) => {
      const currentLevel = oldDatas.buildings[building.name] || 0;
      const costIsOk = Object.keys(building.cost).every((costKey) => {
        if (!oldDatas.resources[costKey]) {
          return false;
        }
        if (oldDatas.resources[costKey].quantity < Math.ceil(building.cost[costKey] * Math.pow(1.2, currentLevel))) {
          return false;
        }
        return true;
      });
      if (!costIsOk) {
        return;
      }

      const datas: IGame = this.cloneDatas(oldDatas);
      Object.keys(building.cost).every((costKey) => {
        datas.resources[costKey].quantity -= Math.ceil(building.cost[costKey] * Math.pow(1.2, currentLevel));
      });
      if (!oldDatas.buildings[building.name]) {
        datas.buildings[building.name] = 1;
      } else {
        datas.buildings[building.name]++;
      }
      this.buildingsService.setBuildingCount(gameContext, building, datas.buildings[building.name], [], 0, datas);
      datas.calculated.nextEvent = 0;
      this.datas$.next(datas);
      return this.persistentService.save(datas).toPromise().then(() => { });
    });
  }

  public research(research: IResearch): Observable<void> {
    return this.lock((oldDatas, gameContext) => {
      const currentLevel = oldDatas.researchs[research.name] || 0;
      const costIsOk = Object.keys(research.cost).every((costKey) => {
        if (!oldDatas.resources[costKey]) {
          return false;
        }
        if (oldDatas.resources[costKey].quantity < Math.ceil(research.cost[costKey] * Math.pow(1.2, currentLevel))) {
          return false;
        }
        return true;
      });
      if (!costIsOk) {
        return;
      }
      const datas: IGame = this.cloneDatas(oldDatas);
      Object.keys(research.cost).every((costKey) => {
        datas.resources[costKey].quantity -= Math.ceil(research.cost[costKey] * Math.pow(1.2, currentLevel));
      });
      if (!oldDatas.researchs[research.name]) {
        datas.researchs[research.name] = 1;
      } else {
        datas.researchs[research.name]++;
      }
      this.researchsService.setResearchLevel(gameContext, research, datas.researchs[research.name], [], 0, datas);
      datas.calculated.nextEvent = 0;
      this.datas$.next(datas);
      return this.persistentService.save(datas).toPromise().then(() => { });
    });
  }

  private lock<T>(callback: (datas: IGame, gameContext: ICalculatedGameContext, config: IConfig) => Promise<T> | T): Observable<T> {
    let resolve;
    const newPromise = new Promise<void>((resolveParam) => {
      resolve = resolveParam;
    });
    let resolveWait;
    const promiseWait = new Promise<void>((resolveParam) => {
      resolveWait = resolveParam;
    });
    this.nextLock = this.nextLock.then(() => {
      resolveWait();
      return newPromise;
    });
    return from(promiseWait).pipe(
      withLatestFrom(this.datas$, this.gameContext$, this.configService.config$),
      switchMap(([_, datas, context, config]): Promise<T> => {
        return Promise.resolve().then(() => callback(datas, context, config));
      }),
      finalize(() => {
        resolve();
      }),
    );
  }

  public addBuildingInFavorites(building: IBuilding): Observable<void> {
    return this.lock((game) => {
      this.favoritesService.addBuildingInFavorites(building);
      if (game.favorites.findIndex((f) => f.type === EFavoriteType.BUILDING && f.name === building.name) < 0) {
        game.favorites.push({
          name: building.name,
          type: EFavoriteType.BUILDING,
        });
        this.persistentService.save(game);
      }
    });
  }

  public removeBuildingFromFavorites(building: IBuilding): Observable<void> {
    return this.lock((game) => {
      this.favoritesService.removeBuildingFromFavorites(building);
      if (game.favorites.findIndex((f) => f.type === EFavoriteType.BUILDING && f.name === building.name) >= 0) {
        game.favorites = game.favorites.filter((f) => f.type !== EFavoriteType.BUILDING || f.name !== building.name);
        this.persistentService.save(game);
      }
    });
  }

  public addResearchInFavorites(research: IResearch): Observable<void> {
    return this.lock((game) => {
      this.favoritesService.addResearchInFavorites(research);
      if (game.favorites.findIndex((f) => f.type === EFavoriteType.RESEARCH && f.name === research.name) < 0) {
        game.favorites.push({
          name: research.name,
          type: EFavoriteType.RESEARCH,
        });
        this.persistentService.save(game);
      }
    });
  }

  public removeResearchFromFavorites(research: IResearch): Observable<void> {
    return this.lock((game) => {
      this.favoritesService.removeResearchFromFavorites(research);
      if (game.favorites.findIndex((f) => f.type === EFavoriteType.RESEARCH && f.name === research.name) >= 0) {
        game.favorites = game.favorites.filter((f) => f.type !== EFavoriteType.RESEARCH || f.name !== research.name);
        this.persistentService.save(game);
      }
    });
  }
}
