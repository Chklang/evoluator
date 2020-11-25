import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, finalize, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import {
  IGame,
  IBlocker,
  IResource,
  IGameContext,
  IBuilding,
  createDictionnaryBuilding,
  createDictionnaryResource,
  IResourceBlocker,
  IChainedFeatureUnlock,
  createDictionnaryFeature,
  IFeature
} from '../../model';

interface ICalculatedGameContext {
  allResources: Dictionnary<string, IResource>;
  allBuildings: Dictionnary<string, IBuilding>;
  allFeatures: Dictionnary<string, IFeature>;
  gameFromScratch: IGame;
}
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  public readonly datas$: Subject<IGame> = new ReplaySubject(1);
  private readonly refreshDatas: Subject<void> = new ReplaySubject(1);
  private refreshInProgress: Subject<boolean> = new BehaviorSubject(false);

  private gameContext$: Subject<ICalculatedGameContext> = new ReplaySubject(1);
  private resourcesByKey: Record<string, IResource> = {};
  private updateEventKey: any | undefined = undefined;

  constructor() {
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
        this.datas$.next(this.updateShowableElements(context));
        return this.refreshDatas.pipe(
          switchMap(() => this.refreshInProgress.pipe(
            filter((refreshInProgress) => {
              if (refreshInProgress) {
                return false;
              }
              return true;
            }),
            take(1),
            tap(() => {
              this.refreshInProgress.next(true);
            }),
          )),
        );
      }),
      withLatestFrom(this.datas$, this.gameContext$),
    ).subscribe(([_, oldDatas, gameContext]) => {
      const datas: IGame = this.cloneDatas(oldDatas);
      this.updateGame(datas, gameContext);
      this.datas$.next(datas);
      this.refreshInProgress.next(false);
    });
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
      gameFromScratch: context.gameFromScratch,
    });
  }

  public start(): void {
    if (this.updateEventKey) {
      clearInterval(this.updateEventKey);
    }
    this.updateEventKey = setInterval(() => {
      this.refreshDatas.next();
    }, 1000);
  }
  public stop(): void {
    clearInterval(this.updateEventKey);
  }

  private updateShowableElements(gameContext: ICalculatedGameContext): IGame {
    const datas: IGame = JSON.parse(JSON.stringify(gameContext.gameFromScratch));
    datas.showableElements.buildings = createDictionnaryBuilding(
      gameContext.allBuildings.filter((building) => Object.keys(building.blockedBy).every((key) => {
        return false;
      }))
    );
    datas.showableElements.resources = createDictionnaryResource(
      gameContext.allResources.filter((resource) => Object.keys(resource.blockedBy).every((key) => {
        return false;
      }))
    );
    datas.showableElements.features = createDictionnaryFeature(
      gameContext.allFeatures.filter((feature) => Object.keys(feature.blockedBy).every((key) => {
        return false;
      }))
    );
    return datas;
  }

  private updateGame(game: IGame, gameContext: ICalculatedGameContext): void {
    const now = Date.now();
    while (game.calculated.nextEvent < now) {
      this.updateUntilEvent(game, now);
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
          Math.min(
            game.resources[resource].max,
            game.resources[resource].quantity = Math.round(
              (game.resources[resource].quantity * Math.pow(game.calculated.production[resource], diff) + Number.EPSILON) * 1_000
            ) / 1000
          );
          break;
        case 'CLASSIC':
        default:
          Math.min(
            game.resources[resource].max,
            game.resources[resource].quantity = Math.round(
              (game.resources[resource].quantity + (game.calculated.production[resource] * diff) + Number.EPSILON) * 1_000
            ) / 1000
          );
          break;
      }
    });
    while (game.calculated.unlockFeature && game.calculated.unlockFeature.time < now) {
      game.showableElements.features.addElement(game.calculated.unlockFeature.feature.name, game.calculated.unlockFeature.feature);
      game.calculated.unlockFeature = game.calculated.unlockFeature.nextUnlock;
    }
    game.time = now;
  }

  private defaultValue<T>(value: T | undefined, defaultValue: T): T {
    if (value === undefined) {
      return defaultValue;
    }
    return value;
  }

  private calculateNextEvent(game: IGame, gameContext: ICalculatedGameContext): void {
    let consumtion: Record<string, number>;
    let production: Record<string, number>;
    const percentConsumtion: Record<string, number> = {};
    const percentProduction: Record<string, number> = {};
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
          let buildingProduction = 1;
          Object.keys(building.consume).forEach((consume) => {
            if (percentConsumtion[consume] !== undefined) {
              buildingProduction = Math.min(buildingProduction, percentConsumtion[consume]);
            }
          });
          Object.keys(building.produce).forEach((produce) => {
            if (percentProduction[produce] !== undefined) {
              buildingProduction = Math.min(buildingProduction, percentProduction[produce]);
            }
          });
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
          const percent = Math.min(1, production[consume] / consumtion[consume]);
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
          const percent = Math.min(1, consumtion[produce] / production[produce]);
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
    const toUnlock: IChainedFeatureUnlock[] = [];
    gameContext.allFeatures.forEach((feature) => {
      if (game.showableElements.features.hasElement(feature.name)) {
        // Already unlocked
        return;
      }
      const blockedUntil = this.blockedUntil(game, gameContext, feature.blockedBy || []);
      toUnlock.push({
        feature,
        time: game.time + (blockedUntil * 1000),
      });
    });
    toUnlock.sort((a, b) => a.time - b.time);
    game.calculated.unlockFeature = toUnlock.reduce((previous, current) => {
      if (!previous) {
        return current;
      }
      previous.nextUnlock = current;
      return current;
    }, undefined);

    game.calculated.nextEvent = game.time + (nextEmptyOrFullStorage * 1000);
  }

  private blockedUntil(game: IGame, gameContext: ICalculatedGameContext, blockers: IBlocker<any>[]): number {
    const times = blockers.filter((blocker) => {
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
    }).map((blocker) => {
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
      return 0;
    }
    return times.reduce((previous, current) => Math.min(previous, current), +Infinity);
  }

  public build(building: IBuilding): Observable<void> {
    return this.refreshInProgress.pipe(
      filter((refreshInProgress) => refreshInProgress === false),
      take(1),
      tap(() => this.refreshInProgress.next(true)),
      withLatestFrom(this.datas$),
      map(([_, oldDatas]) => {
        const costIsOk = Object.keys(building.cost).every((costKey) => {
          if (!oldDatas.resources[costKey]) {
            return false;
          }
          if (oldDatas.resources[costKey].quantity < building.cost[costKey]) {
            return false;
          }
          return true;
        });
        if (!costIsOk) {
          return;
        }

        const datas: IGame = this.cloneDatas(oldDatas);
        Object.keys(building.cost).every((costKey) => {
          datas.resources[costKey].quantity -= building.cost[costKey];
        });
        if (!oldDatas.buildings[building.name]) {
          datas.buildings[building.name] = 1;
        } else {
          datas.buildings[building.name]++;
        }
        datas.calculated.nextEvent = 0;
        this.datas$.next(datas);
      }),
      finalize(() => this.refreshInProgress.next(false)),
    );
  }
}
