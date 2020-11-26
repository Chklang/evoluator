import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { IBlocker, IResearch, IResource } from '../../model';
import { IBlockerStatus } from '../../model/i-blocker-status';
import { ICalculatedGameContext } from '../store/store.service';

@Injectable({
  providedIn: 'root'
})
export class ResearchsService {
  private showableResearchs$: Record<string, Subject<IShowableResearch>> = {};
  private allShowableResearchs: Dictionnary<string, IShowableResearch> = Dictionnary.create();
  public allShowableResearchs$: Subject<Dictionnary<string, IShowableResearch>> = new BehaviorSubject(this.allShowableResearchs);

  constructor() { }

  public listenResearch(research: IResearch): Observable<IShowableResearch> {
    if (!this.showableResearchs$[research.name]) {
      this.showableResearchs$[research.name] = new ReplaySubject(1);
    }
    return this.showableResearchs$[research.name];
  }

  public setResearchLevel(
    gameContext: ICalculatedGameContext,
    research: IResearch,
    level: number,
    blockedBy: IBlocker<any>[],
    blockedUntil: number
  ): void {
    const showable: IShowableResearch = {
      research,
      level,
      costNextLevel: this.dict(Object.keys(research.cost).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.cost[key] * Math.pow(1.2, level)),
        };
      }), (e) => e.resource.name),
      bonusResourceCurrentLevel: this.dict(Object.keys(research.bonusResources).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.bonusResources[key] * Math.pow(1.2, level - 1)),
        };
      }), (e) => e.resource.name),
      bonusResourceNextLevel: this.dict(Object.keys(research.bonusResources).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.bonusResources[key] * Math.pow(1.2, level)),
        };
      }), (e) => e.resource.name),
      bonusBuildingCostsCurrentLevel: this.dict(Object.keys(research.bonusBuildingCosts).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.bonusBuildingCosts[key] * Math.pow(1.2, level - 1)),
        };
      }), (e) => e.resource.name),
      bonusBuildingCostsNextLevel: this.dict(Object.keys(research.bonusBuildingCosts).map((key): IResourceCount => {
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.bonusBuildingCosts[key] * Math.pow(1.2, level)),
        };
      }), (e) => e.resource.name),
      blockersStatus: (research.blockedBy || []).map((blocker): IBlockerStatus => {
        return {
          blocker,
          isOk: blockedBy.indexOf(blocker) === -1,
        };
      }),
      blockedUntil,
    };
    this.allShowableResearchs.addElement(research.name, showable);
    this.allShowableResearchs$.next(this.allShowableResearchs);
    if (!this.showableResearchs$[research.name]) {
      this.showableResearchs$[research.name] = new BehaviorSubject(showable);
    } else {
      this.showableResearchs$[research.name].next(showable);
    }
  }

  private dict<T, U extends string>(values: T[], getKey: (e: T) => U): Dictionnary<U, T> {
    const result = Dictionnary.create<U, T>();
    values.forEach((value) => {
      result.addElement(getKey(value), value);
    });
    return result;
  }
}

export interface IShowableResearch {
  research: IResearch;
  level: number;
  blockedUntil: number;
  costNextLevel: Dictionnary<string, IResourceCount>;
  bonusResourceCurrentLevel: Dictionnary<string, IResourceCount>;
  bonusResourceNextLevel: Dictionnary<string, IResourceCount>;
  bonusBuildingCostsCurrentLevel: Dictionnary<string, IResourceCount>;
  bonusBuildingCostsNextLevel: Dictionnary<string, IResourceCount>;
  blockersStatus: IBlockerStatus[];
}

export interface IResourceCount {
  resource: IResource;
  count: number;
}
