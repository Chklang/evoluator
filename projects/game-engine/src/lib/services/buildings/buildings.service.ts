import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IBlocker, IBlockerStatus, IBuilding, IResource } from '../../model';
import { IResourceCount } from '../../model/i-resource-count';
import { ICalculatedGameContext } from '../store/store.service';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService {

  constructor() { }
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
    blockedUntil: number
  ): void {
    const showable: IShowableBuilding = {
      building,
      count,
      costNextLevel: this.dict(Object.keys(building.cost).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.cost[key] * Math.pow(1.2, count)),
        };
      }), (e) => e.resource.name),
      consumeCurrentLevel: this.dict(Object.keys(building.consume).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.consume[key] * Math.pow(1.2, count - 1)),
        };
      }), (e) => e.resource.name),
      consumeNextLevel: this.dict(Object.keys(building.consume).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.consume[key] * Math.pow(1.2, count)),
        };
      }), (e) => e.resource.name),
      produceCurrentLevel: this.dict(Object.keys(building.produce).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.produce[key] * Math.pow(1.2, count - 1)),
        };
      }), (e) => e.resource.name),
      produceNextLevel: this.dict(Object.keys(building.produce).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.produce[key] * Math.pow(1.2, count)),
        };
      }), (e) => e.resource.name),
      storageCurrentLevel: this.dict(Object.keys(building.storage).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.storage[key] * Math.pow(1.2, count - 1)),
        };
      }), (e) => e.resource.name),
      storageNextLevel: this.dict(Object.keys(building.storage).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(building.storage[key] * Math.pow(1.2, count)),
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
  costNextLevel: Dictionnary<string, IResourceCount>;
  consumeCurrentLevel: Dictionnary<string, IResourceCount>;
  consumeNextLevel: Dictionnary<string, IResourceCount>;
  produceCurrentLevel: Dictionnary<string, IResourceCount>;
  produceNextLevel: Dictionnary<string, IResourceCount>;
  storageCurrentLevel: Dictionnary<string, IResourceCount>;
  storageNextLevel: Dictionnary<string, IResourceCount>;
  blockersStatus: IBlockerStatus[];
}
