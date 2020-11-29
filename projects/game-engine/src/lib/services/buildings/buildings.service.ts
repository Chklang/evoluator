import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, shareReplay, takeWhile, tap } from 'rxjs/operators';
import {
  IResource,
  IBuilding,
  IResourceCount,
  IBlocker,
  IBlockerStatus,
  IResourceNeed,
  IGame
} from '../../model';
import { ICalculatedGameContext } from '../store/i-calculated-game-context';
import { TickService } from '../tick/tick.service';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService {

  constructor(
    private readonly tickService: TickService,
  ) { }
  private allShowableBuildings: Dictionnary<string, IShowableBuilding> = Dictionnary.create();
  public allShowableBuildings$: Subject<Dictionnary<string, IShowableBuilding>> = new BehaviorSubject(this.allShowableBuildings);

  public listenBuilding(building: IBuilding): Observable<IShowableBuilding> {
    return this.allShowableBuildings$.pipe(
      map((allShowable) => allShowable.getElement(building.name)),
      filter((showable) => showable !== undefined),
    );
  }

  public listenBuildingByResource(resource: IResource): Observable<IShowableBuilding[]> {
    return this.allShowableBuildings$.pipe(
      map((allShowable) => allShowable.filter(building =>
        building.consumeNextLevel.hasElement(resource.name) ||
        building.produceNextLevel.hasElement(resource.name) ||
        building.storageNextLevel.hasElement(resource.name)
      )),
    );
  }

  public setBuildingCount(
    gameContext: ICalculatedGameContext,
    building: IBuilding,
    count: number,
    blockedBy: IBlocker<any>[],
    blockedUntil: number,
    game: IGame,
  ): void {
    const showable: IShowableBuilding = {
      building,
      count,
      costNextLevel: this.dict(Object.keys(building.cost).map((key): IResourceNeed => {
        const countResourceNeeded = Math.ceil(building.cost[key] * Math.pow(1.2, count));
        let isOk$: Observable<number>;
        const countResourceActual = game.resources[key]?.quantity || 0;
        if (countResourceNeeded <= countResourceActual) {
          isOk$ = of(-1);
        } else if ((game.calculated.production[key] || 0) <= 0) {
          isOk$ = of(0);
        } else {
          let ressourceBlockedUntil: number;
          switch (gameContext.allResources.getElement(key).growType) {
            case 'EXPONENTIAL':
              ressourceBlockedUntil = Math.log(countResourceNeeded / countResourceActual) /
                Math.log(game.calculated.production[key]);
              break;
            case 'CLASSIC':
            default:
              ressourceBlockedUntil = (countResourceNeeded - countResourceActual) / game.calculated.production[key];
              break;
          }
          ressourceBlockedUntil = ressourceBlockedUntil * 1000 + game.time;
          let featureIsAccessible = false;
          isOk$ = this.tickService.tick$.pipe(
            map(() => ressourceBlockedUntil - Date.now()),
            map((value) => (Math.ceil(value / 1000) * 1000) || -1), // Never 0, 0=not accessible
            takeWhile(() => !featureIsAccessible),
            tap((value) => {
              if (value < 0) {
                featureIsAccessible = true;
              }
            }),
            shareReplay(1),
          );
        }
        return {
          resource: gameContext.allResources.getElement(key),
          count: countResourceNeeded,
          isOk$,
        };
      }), (e) => e.resource.name),
      consumeCurrentLevel: this.dict(Object.keys(building.consume).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.produce[key] * count,
        };
      }), (e) => e.resource.name),
      consumeNextLevel: this.dict(Object.keys(building.consume).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.produce[key] * (count + 1),
        };
      }), (e) => e.resource.name),
      produceCurrentLevel: this.dict(Object.keys(building.produce).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.produce[key] * count,
        };
      }), (e) => e.resource.name),
      produceNextLevel: this.dict(Object.keys(building.produce).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.produce[key] * (count + 1),
        };
      }), (e) => e.resource.name),
      storageCurrentLevel: this.dict(Object.keys(building.storage).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.storage[key] * count,
        };
      }), (e) => e.resource.name),
      storageNextLevel: this.dict(Object.keys(building.storage).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: building.storage[key] * (count + 1),
        };
      }), (e) => e.resource.name),
      blockersStatus: (building.blockedBy || []).map((blocker): IBlockerStatus => {
        return {
          blocker,
          isOk: blockedBy.indexOf(blocker) === -1,
        };
      }),
      blockedUntil,
    };
    this.allShowableBuildings.addElement(building.name, showable);
    this.allShowableBuildings$.next(this.allShowableBuildings);
  }

  private dict<T, U extends string>(values: T[], getKey: (e: T) => U): Dictionnary<U, T> {
    const result = Dictionnary.create<U, T>();
    values.forEach((value) => {
      result.addElement(getKey(value), value);
    });
    return result;
  }
}

export interface IShowableBuilding {
  building: IBuilding;
  count: number;
  blockedUntil: number;
  costNextLevel: Dictionnary<string, IResourceNeed>;
  consumeCurrentLevel: Dictionnary<string, IResourceCount>;
  consumeNextLevel: Dictionnary<string, IResourceCount>;
  produceCurrentLevel: Dictionnary<string, IResourceCount>;
  produceNextLevel: Dictionnary<string, IResourceCount>;
  storageCurrentLevel: Dictionnary<string, IResourceCount>;
  storageNextLevel: Dictionnary<string, IResourceCount>;
  blockersStatus: IBlockerStatus[];
}
