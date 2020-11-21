import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { filter, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { IGame, IResource, IGameContext } from '../../model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  public readonly datas$: Subject<IGame> = new ReplaySubject(1);
  private readonly refreshDatas: Subject<void> = new ReplaySubject(1);
  private refreshInProgress = false;

  private gameContext$: Subject<IGameContext> = new ReplaySubject(1);
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
          filter(() => {
            if (this.refreshInProgress) {
              return false;
            }
            this.refreshInProgress = true;
            return true;
          }),
        );
      }),
      withLatestFrom(this.datas$),
      withLatestFrom(this.gameContext$),
    ).subscribe(([[_, oldDatas], gameContext]) => {
      const datas: IGame = JSON.parse(JSON.stringify(oldDatas));
      datas.calculated.nextEvent = oldDatas.calculated.nextEvent;
      this.updateGame(datas, gameContext);
      this.datas$.next(datas);
      this.refreshInProgress = false;
    });
  }

  public init(context: IGameContext): void {
    this.gameContext$.next(context);
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

  private updateShowableElements(gameContext: IGameContext): IGame {
    const datas: IGame = JSON.parse(JSON.stringify(gameContext.gameFromScratch));
    datas.showableElements.buildings = gameContext.allBuildings.filter((building) => Object.keys(building.blockedBy).every((key) => {
      return false;
    })).map((b) => b.name);
    datas.showableElements.resources = gameContext.allResources.filter((resource) => Object.keys(resource.blockedBy).every((key) => {
      return false;
    })).map((b) => b.name);
    return datas;
  }

  private updateGame(game: IGame, gameContext: IGameContext): void {
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
          game.resources[resource].quantity = Math.round(
            (game.resources[resource].quantity * Math.pow(game.calculated.production[resource], diff) + Number.EPSILON) * 1_000
          ) / 1000;
          break;
        case 'CLASSIC':
        default:
          game.resources[resource].quantity = Math.round(
            (game.resources[resource].quantity + (game.calculated.production[resource] * diff) + Number.EPSILON) * 1_000
          ) / 1000;
          break;
      }
    });
    game.time = now;
  }

  private defaultValue<T>(value: T | undefined, defaultValue: T): T {
    if (value === undefined) {
      return defaultValue;
    }
    return value;
  }

  private calculateNextEvent(game: IGame, gameContext: IGameContext): void {
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
        if (this.resourcesByKey[resource].selfGrow !== undefined) {
          if (this.resourcesByKey[resource].selfGrow! > 0) {
            production[resource] = this.resourcesByKey[resource].selfGrow! * this.defaultValue(percentProduction[resource], 1);
          } else if (this.resourcesByKey[resource].selfGrow! < 0) {
            consumtion[resource] = this.resourcesByKey[resource].selfGrow! * this.defaultValue(percentConsumtion[resource], 1);
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
    game.calculated.nextEvent = game.time + (nextEmptyOrFullStorage * 1000);
  }
}
