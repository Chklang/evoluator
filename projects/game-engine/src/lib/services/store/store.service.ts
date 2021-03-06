import { Injectable } from '@angular/core';
import { defer, from, Observable, ReplaySubject, Subject } from 'rxjs';
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
  IConfig,
  createDictionnaryAchievements,
  IAchievement,
  IChainedUnlockWithLevel,
  IFeatureBlocker,
  IBuildingBlocker
} from '../../model';
import { ModalService } from '../modal/modal.service';
import { AchievementsService } from '../achievements/achievements.service';
import { BuildingsService } from '../buildings/buildings.service';
import { ConfigService } from '../config/config.service';
import { EFavoriteType, FavoritesService, TOGGLE_ACTION } from '../favorites/favorites.service';
import { FeaturesService } from '../features/features.service';
import { MessagesService } from '../messages/messages.service';
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
    private achievementsService: AchievementsService,
    private readonly modalService: ModalService,
  ) {
    this.gameContext$.pipe(
      tap((context) => {
        context.allResources.forEach((resource) => {
          this.resourcesByKey[resource.name] = resource;
          resource.growType = resource.growType || 'CLASSIC';
          resource.min = resource.min || 0;
          switch (resource.growType) {
            case 'CLASSIC':
              resource.selfGrow = this.defaultValue(resource.selfGrow, 0);
              break;
            case 'EXPONENTIAL':
              resource.selfGrow = this.defaultValue(resource.selfGrow, 1);
              break;
          }
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
              switchMap((now) => this.lock((oldDatas) => {
                const datas: IGame = this.cloneDatas(oldDatas);
                this.updateGame(datas, context, now);
                (window as any).cc = datas;
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
    datas.calculated = oldGame.calculated;
    datas.showableElements = oldGame.showableElements;
    return datas;
  }

  public init(context: IGameContext): void {
    this.gameContext$.next({
      allBuildings: createDictionnaryBuilding(context.allBuildings),
      allFeatures: createDictionnaryFeature(context.allFeatures),
      allResources: createDictionnaryResource(context.allResources),
      allResearchs: createDictionnaryResearch(context.allResearchs),
      allAchievements: createDictionnaryAchievements(context.allAchievements),
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

    gameContext.allResources.filter((resource) => Object.keys(resource.blockedBy || {}).every((key) => {
      return false;
    })).forEach((resource) => {
      datas.showableElements.resources.addElement(resource.name, resource);
      if (!datas.resources[resource.name] || datas.resources[resource.name].quantity < (resource.min || 0)) {
        datas.resources[resource.name] = {
          icon: resource.icon,
          max: resource.max,
          min: resource.min,
          quantity: resource.min,
        };
      }
      if (!datas.resourcesTotal[resource.name] || datas.resourcesTotal[resource.name] < 0) {
        datas.resourcesTotal[resource.name] = 0;
      }
    });
    gameContext.allBuildings.filter((building) => Object.keys(building.blockedBy || {}).every((key) => {
      return false;
    })).forEach((building) => {
      datas.showableElements.buildings.addElement(building.name, building);
    });
    datas.showableElements.buildings.forEach((building => {
      const nbBuildings = datas.buildings[building.name] || 0;
      this.buildingsService.setBuildingCount(gameContext, building, nbBuildings, [], 0, datas);
      Object.keys(building.maintenance || {}).forEach((resourceName) => {
        datas.resources[resourceName].min += building.maintenance[resourceName] * nbBuildings;
      });
    }));

    gameContext.allFeatures.filter((feature) => Object.keys(feature.blockedBy || {}).every((key) => {
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

  private updateGame(game: IGame, gameContext: ICalculatedGameContext, now: number): void {
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
        case 'EXPONENTIAL': {
          game.resourcesTotal[resource] += Math.min(
            game.resources[resource].max,
            (game.resources[resource].quantity * Math.pow(game.calculated.productionReal[resource], diff))
          ) - game.resources[resource].quantity;
          game.resources[resource].quantity = Math.min(
            game.resources[resource].max,
            (game.resources[resource].quantity * Math.pow(game.calculated.production[resource], diff))
          );
          break;
        }
        case 'CLASSIC':
        default: {
          game.resourcesTotal[resource] += Math.max(0, game.calculated.productionReal[resource] * diff);
          game.resources[resource].quantity = Math.min(
            game.resources[resource].max,
            (game.resources[resource].quantity + (game.calculated.production[resource] * diff))
          );
          break;
        }
      }
    });
    let newUnlockedElement = false;
    while (game.calculated.unlockFeature && game.calculated.unlockFeature.time < now) {
      game.showableElements.features.addElement(game.calculated.unlockFeature.element.name, game.calculated.unlockFeature.element);
      this.modalService.openModal('features.' + game.calculated.unlockFeature.element.name);
      game.calculated.unlockFeature = game.calculated.unlockFeature.nextUnlock;
      newUnlockedElement = true;
    }
    while (game.calculated.unlockResearch && game.calculated.unlockResearch.time < now) {
      game.showableElements.researchs.addElement(game.calculated.unlockResearch.element.name, game.calculated.unlockResearch.element);
      game.calculated.unlockResearch = game.calculated.unlockResearch.nextUnlock;
      newUnlockedElement = true;
    }
    while (game.calculated.unlockBuilding && game.calculated.unlockBuilding.time < now) {
      game.showableElements.buildings.addElement(game.calculated.unlockBuilding.element.name, game.calculated.unlockBuilding.element);
      game.calculated.unlockBuilding = game.calculated.unlockBuilding.nextUnlock;
      newUnlockedElement = true;
    }
    while (game.calculated.unlockAchievement && game.calculated.unlockAchievement.time < now) {
      const achievement = game.calculated.unlockAchievement.element;
      const level = game.calculated.unlockAchievement.level;
      this.achievementsService.changeOnlyLevel(achievement, level);
      this.modalService.openModal('achievements.' + achievement.name, { level });
      game.achievements[achievement.name] = Math.max(game.achievements[achievement.name] || 0, level);
      game.calculated.unlockAchievement = game.calculated.unlockAchievement.nextUnlock;
      newUnlockedElement = true;
    }
    game.time = now;
    if (newUnlockedElement) {
      this.persistentService.save(game).toPromise();
    }
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
          min: resource.min,
          icon: resource.icon,
        };
        game.resourcesTotal[resource.name] = 0;
      } else {
        game.resources[resource.name].max = resource.max;
        game.resources[resource.name].min = resource.min;
      }
    });
    Object.keys(game.researchs).forEach((researchName) => {
      const level = game.researchs[researchName];
      const research = gameContext.allResearchs.find((e) => e.name === researchName);
      if (!research) {
        console.log('Error : Reseach ' + researchName + ' is unknown!');
        return;
      }
      Object.keys(research.bonusResources || {}).forEach((bonusResourceName) => {
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
        Object.keys(building.storage || {}).forEach((resource) => {
          game.resources[resource].max += building.storage[resource] * game.buildings[building.name];
        });
        Object.keys(building.maintenance || {}).forEach((resourceName) => {
          game.resources[resourceName].min += building.maintenance[resourceName] * game.buildings[building.name];
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
          Object.keys(building.consume || {}).forEach((consume) => {
            if (percentConsumtion[consume] !== undefined) {
              buildingProduction = this.minOrDefaultValue(buildingProduction, percentConsumtion[consume]);
            }
          });
          Object.keys(building.produce || {}).forEach((produce) => {
            if (percentProduction[produce] !== undefined) {
              buildingProduction = this.minOrDefaultValue(buildingProduction, percentProduction[produce]);
            }
          });
          buildingProduction = this.defaultValue(buildingProduction, 1);
          Object.keys(building.consume || {}).forEach((consume) => {
            if (consumtion[consume]) {
              consumtion[consume] += building.consume[consume] * buildingProduction * game.buildings[building.name];
            } else {
              consumtion[consume] = building.consume[consume] * buildingProduction * game.buildings[building.name];
            }
          });
          Object.keys(building.produce || {}).forEach((produce) => {
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
        if ((game.resources[produce].quantity || 0) < game.resources[produce].max) {
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
      consumptionReal: {},
      productionReal: {},
    };
    let nextEmptyOrFullStorage = +Infinity;
    // Calculate moment of next event for each resource
    gameContext.allResources.forEach((resource) => {
      if (consumtion[resource.name] || production[resource.name]) {
        const productionBySec = (production[resource.name] || 0) - (consumtion[resource.name] || 0);
        game.calculated.production[resource.name] = productionBySec;
        game.calculated.consumptionReal[resource.name] = consumtion[resource.name] || 0;
        game.calculated.productionReal[resource.name] = production[resource.name] || 0;
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
                nextEmptyOrFullStorage = Math.min(nextEmptyOrFullStorage, game.resources[resource.name].quantity / (productionBySec * -1));
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
    // Calculate moment of next event for unlock each achievement
    this.updateAllAchievements(game, gameContext);

    game.calculated.nextEvent = game.time + Math.max(1, nextEmptyOrFullStorage * 1000);
  }

  private updateAllFeatures(game: IGame, gameContext: ICalculatedGameContext): void {
    const featureToUnlock: IChainedUnlock<IFeature>[] = [];
    let newFeatureWasAdded = false;
    do {
      featureToUnlock.length = 0;
      newFeatureWasAdded = false;
      gameContext.allFeatures.forEach((feature) => {
        if (game.showableElements.features.hasElement(feature.name)) {
          // Already unlocked
          return;
        }
        const blockedUntil = this.blockedUntil(game, gameContext, feature.blockedBy || []);
        const timeBlocked = game.time + (blockedUntil.time * 1000);
        this.featuresService.setFeature(gameContext, feature, blockedUntil.blockers, timeBlocked);
        if (blockedUntil.time === 0) {
          game.showableElements.features.addElement(feature.name, feature);
          this.modalService.openModal('features.' + feature.name);
          newFeatureWasAdded = true;
        }
        featureToUnlock.push({
          element: feature,
          time: timeBlocked,
        });
      });
    } while (newFeatureWasAdded);
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
    game.calculated.unlockResearch = researchToUnlock.reduceRight((previous, current) => {
      if (!current) {
        return previous;
      }
      current.nextUnlock = previous;
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
    game.calculated.unlockBuilding = buildingsToUnlock.reduceRight((previous, current) => {
      if (!current) {
        return previous;
      }
      current.nextUnlock = previous;
      return current;
    }, undefined);
  }

  private updateAllAchievements(game: IGame, gameContext: ICalculatedGameContext): void {
    const achievementsToUnlock: IChainedUnlockWithLevel<IAchievement>[] = [];
    gameContext.allAchievements.forEach((achievement) => {
      let level = game.achievements[achievement.name] || 0;
      if (level === achievement.levels.length) {
        // Achievement already completed
        this.achievementsService.setAchievementLevel(gameContext, achievement, level, [], [], game);
        return;
      }
      const blockedUntilsNextLevels: IBlocker<any>[][] = [];
      const timeBlockedNextLevels: number[] = [];
      for (let i = level; i < achievement.levels.length; i++) {
        const currentLevelOfAchievement = achievement.levels[i];
        const blockedUntil = this.blockedUntil(game, gameContext, currentLevelOfAchievement.blockers || []);
        if (blockedUntil.blockers.length === 0) {
          this.modalService.openModal('achievements.' + achievement.name, { level });
          level = i + 1;
        } else {
          const timeBlocked = game.time + (blockedUntil.time * 1000);
          blockedUntilsNextLevels.push(blockedUntil.blockers);
          timeBlockedNextLevels.push(timeBlocked);
          achievementsToUnlock.push({
            element: achievement,
            time: timeBlocked,
            level: i + 1,
          });
        }
      }
      game.achievements[achievement.name] = level;
      this.achievementsService.setAchievementLevel(gameContext, achievement, level, blockedUntilsNextLevels, timeBlockedNextLevels, game);
    });
    achievementsToUnlock.sort((a, b) => {
      if (a.time === b.time) {
        return a.level - b.level;
      }
      return a.time - b.time;
    });
    game.calculated.unlockAchievement = achievementsToUnlock.reduceRight((previous, current) => {
      if (!current) {
        return previous;
      }
      current.nextUnlock = previous;
      return current;
    }, undefined);
  }

  private blockedUntil(
    game: IGame,
    gameContext: ICalculatedGameContext,
    blockers: IBlocker<any>[],
  ): { time: number, blockers: IBlocker<any>[] } {
    const blockersActual = blockers.filter((blocker) => {
      switch (blocker.type) {
        case 'building': {
          const typedBlocker = blocker as IBuildingBlocker;
          const nbBuilding = game.buildings[typedBlocker.params.name] || 0;
          return nbBuilding < typedBlocker.params.quantity;
        }
        case 'feature': {
          const typedBlocker = blocker as IFeatureBlocker;
          return !game.showableElements.features.hasElement(typedBlocker.params.name);
        }
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
        case 'resourceTotal': {
          const typedBlocker = blocker as IResourceBlocker;
          if (!game.resourcesTotal[typedBlocker.params.name]) {
            // Resource stocks are empty
            return true;
          }
          if (game.resourcesTotal[typedBlocker.params.name] < typedBlocker.params.quantity) {
            return true;
          }
          return false;
        }
      }
    });
    const times = blockersActual.map((blocker) => {
      switch (blocker.type) {
        case 'building': {
          const typedBlocker = blocker as IBuildingBlocker;
          const nbBuilding = game.buildings[typedBlocker.params.name] || 0;
          return nbBuilding > typedBlocker.params.quantity ? 0 : +Infinity;
        }
        case 'feature': {
          const typedBlocker = blocker as IFeatureBlocker;
          const hasFeature = game.showableElements.features.hasElement(typedBlocker.params.name);
          return hasFeature ? 0 : +Infinity;
        }
        case 'resource': {
          const typedBlocker = blocker as IResourceBlocker;
          if (!game.calculated.production[typedBlocker.params.name] || game.calculated.production[typedBlocker.params.name] < 0) {
            // Resource stocks not grow up, it will never produce sufficient quantity
            return +Infinity;
          }
          const currentQuantity = game.resources[typedBlocker.params.name]?.quantity || 0;
          switch (gameContext.allResources.getElement(typedBlocker.params.name).growType) {
            case 'EXPONENTIAL':
              if (currentQuantity === 0) {
                return +Infinity;
              }
              return Math.log(typedBlocker.params.quantity / currentQuantity) /
                Math.log(game.calculated.production[typedBlocker.params.name]);
            case 'CLASSIC':
            default:
              const missing = typedBlocker.params.quantity - currentQuantity;
              return missing / game.calculated.production[typedBlocker.params.name];
          }
        }
        case 'resourceTotal': {
          const typedBlocker = blocker as IResourceBlocker;
          if (!game.calculated.productionReal[typedBlocker.params.name] || game.calculated.productionReal[typedBlocker.params.name] < 0) {
            // Resource stocks not grow up, it will never produce sufficient quantity
            return +Infinity;
          }
          const currentQuantity = game.resourcesTotal[typedBlocker.params.name] || 0;
          switch (gameContext.allResources.getElement(typedBlocker.params.name).growType) {
            case 'EXPONENTIAL':
              if (currentQuantity === 0) {
                return +Infinity;
              }
              return Math.log(typedBlocker.params.quantity / currentQuantity) /
                Math.log(game.calculated.productionReal[typedBlocker.params.name]);
            case 'CLASSIC':
            default:
              const missing = typedBlocker.params.quantity - currentQuantity;
              return missing / game.calculated.productionReal[typedBlocker.params.name];
          }
        }
      }
    });
    if (times.length === 0) {
      return { time: 0, blockers: [] };
    }
    return { time: times.reduce((previous, current) => Math.max(previous, current), 0), blockers: blockersActual };
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
      }) && Object.keys(building.maintenance || {}).every((costKey) => {
        if ((oldDatas.resources[costKey].min + building.maintenance[costKey]) > oldDatas.resources[costKey].quantity) {
          return false;
        }
        return true;
      });
      if (!costIsOk) {
        return Promise.reject(MessagesService.create({
          code: 'messages.buildings.build',
          type: 'ERROR',
          values: [building.name],
          persistent: false,
        }));
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
      datas.buildingsMax[building.name] = Math.max(datas.buildingsMax[building.name] || 0, datas.buildings[building.name]);
      this.buildingsService.setBuildingCount(gameContext, building, datas.buildings[building.name], [], 0, datas);
      datas.calculated.nextEvent = 0;
      this.datas$.next(datas);
      return this.persistentService.save(datas).toPromise().then(() => { });
    });
  }

  public destroy(building: IBuilding): Observable<void> {
    return this.lock((oldDatas, gameContext) => {
      if (!oldDatas.buildings[building.name]) {
        return Promise.reject(MessagesService.create({
          code: 'messages.buildings.destroy',
          type: 'ERROR',
          values: [building.name],
          persistent: false,
        }));
      }
      // Check if storage after destruction is correct (max storage greater than min storage)
      const newStorageIsOk = Object.keys(building.storage || {}).every((key) => {
        if (!oldDatas.resources[key]) {
          return true;
        }
        const min = oldDatas.resources[key].min || 0;
        const max = oldDatas.resources[key].max || 0;
        if (max - building.storage[key] < min) {
          return false;
        }
        return true;
      });
      if (!newStorageIsOk) {
        return Promise.reject(MessagesService.create({
          code: 'messages.buildings.destroy',
          type: 'ERROR',
          values: [building.name],
          persistent: false,
        }));
      }
      const datas: IGame = this.cloneDatas(oldDatas);
      datas.buildings[building.name]--;
      Object.keys(building.storage || {}).forEach((key) => {
        if (!datas.resources[key]) {
          return;
        }
        const stock = datas.resources[key].quantity || 0;
        datas.resources[key].max -= building.storage[key];
        datas.resources[key].quantity = Math.min(stock, datas.resources[key].max);
      });
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
        return Promise.reject(MessagesService.create({
          code: 'messages.researchs.search',
          type: 'ERROR',
          values: [research.name],
          persistent: false,
        }));
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
      datas.researchsMax[research.name] = Math.max(datas.researchsMax[research.name] || 0, datas.researchs[research.name]);
      this.researchsService.setResearchLevel(gameContext, research, datas.researchs[research.name], [], 0, datas);
      datas.calculated.nextEvent = 0;
      this.datas$.next(datas);
      return this.persistentService.save(datas).toPromise().then(() => { });
    });
  }

  private lock<T>(callback: (datas: IGame, gameContext: ICalculatedGameContext, config: IConfig) => Promise<T> | T): Observable<T> {
    return defer(() => {
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
    });
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

  public toggleBuildingFromFavorites(building: IBuilding): Observable<void> {
    return this.lock((game) => {
      switch (this.favoritesService.toggleBuildingFromFavorites(building)) {
        case TOGGLE_ACTION.ADDED:
          if (game.favorites.findIndex((f) => f.type === EFavoriteType.BUILDING && f.name === building.name) < 0) {
            game.favorites.push({
              name: building.name,
              type: EFavoriteType.BUILDING,
            });
            this.persistentService.save(game);
          }
          break;
        case TOGGLE_ACTION.REMOVED:
          if (game.favorites.findIndex((f) => f.type === EFavoriteType.BUILDING && f.name === building.name) >= 0) {
            game.favorites = game.favorites.filter((f) => f.type !== EFavoriteType.BUILDING || f.name !== building.name);
            this.persistentService.save(game);
          }
          break;
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

  public toggleResearchFromFavorites(research: IResearch): Observable<void> {
    return this.lock((game) => {
      switch (this.favoritesService.toggleResearchFromFavorites(research)) {
        case TOGGLE_ACTION.ADDED:
          if (game.favorites.findIndex((f) => f.type === EFavoriteType.RESEARCH && f.name === research.name) < 0) {
            game.favorites.push({
              name: research.name,
              type: EFavoriteType.RESEARCH,
            });
            this.persistentService.save(game);
          }
          break;
        case TOGGLE_ACTION.REMOVED:
          if (game.favorites.findIndex((f) => f.type === EFavoriteType.RESEARCH && f.name === research.name) >= 0) {
            game.favorites = game.favorites.filter((f) => f.type !== EFavoriteType.RESEARCH || f.name !== research.name);
            this.persistentService.save(game);
          }
          break;
      }
    });
  }

  public generateResource(resource: IResource): Observable<void> {
    return this.lock((game) => {
      if (!game.showableElements.resources.hasElement(resource.name)) {
        // TODO detect CHEAT!! Resource not visible!
        return Promise.reject(MessagesService.create({
          code: 'messages.cheat.generateResource',
          type: 'ERROR',
          persistent: false,
          values: [resource.name],
        }));
      }
      if (game.resources[resource.name].quantity >= game.resources[resource.name].max) {
        // Already max, ignore!
        return Promise.resolve();
      }
      const remainingPlace = Math.min(1, game.resources[resource.name].max - game.resources[resource.name].quantity);
      game.resources[resource.name].quantity += remainingPlace;
      game.resourcesTotal[resource.name] += remainingPlace;
      game.calculated.nextEvent = 0;
      return Promise.resolve();
    });
  }
}
