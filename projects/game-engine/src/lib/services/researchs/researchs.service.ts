import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, shareReplay, takeWhile, tap } from 'rxjs/operators';
import {
  IBlocker,
  IResearch,
  IBlockerStatus,
  IResourceCount,
  IResourceNeed,
  IGame
} from '../../model';
import { ICalculatedGameContext } from '../store/i-calculated-game-context';
import { TickService } from '../tick/tick.service';

@Injectable({
  providedIn: 'root'
})
export class ResearchsService {
  private allShowableResearchs: Dictionnary<string, IShowableResearch> = Dictionnary.create();
  public allShowableResearchs$: Subject<Dictionnary<string, IShowableResearch>> = new BehaviorSubject(this.allShowableResearchs);

  constructor(
    private readonly tickService: TickService,
  ) { }

  public listenResearch(research: IResearch): Observable<IShowableResearch> {
    return this.allShowableResearchs$.pipe(
      map((allShowable) => allShowable.getElement(research.name)),
      filter((showable) => showable !== undefined),
    );
  }

  public setResearchLevel(
    gameContext: ICalculatedGameContext,
    research: IResearch,
    level: number,
    blockedBy: IBlocker<any>[],
    blockedUntil: number,
    game: IGame,
  ): void {
    const blockers = (research.blockedBy || []).map((blocker): IBlockerStatus => {
      return {
        blocker,
        isOk: blockedBy.indexOf(blocker) === -1,
      };
    });
    let timeBeforeUnlock: Observable<number>;
    if (blockers.every((e) => e.isOk)) {
      timeBeforeUnlock = new BehaviorSubject(-1);
    } else {
      let featureIsAccessible = false;
      timeBeforeUnlock = this.tickService.tick$.pipe(
        map(() => blockedUntil - Date.now()),
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
    const showable: IShowableResearch = {
      research,
      level,
      costNextLevel: this.dict(Object.keys(research.cost).map((key): IResourceNeed => {
        const countResourceNeeded = Math.ceil(research.cost[key] * Math.pow(1.2, level));
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
          let researchCanBeResearched = false;
          isOk$ = this.tickService.tick$.pipe(
            map(() => ressourceBlockedUntil - Date.now()),
            map((value) => (Math.ceil(value / 1000) * 1000) || -1), // Never 0, 0=not accessible
            takeWhile(() => !researchCanBeResearched),
            tap((value) => {
              if (value < 0) {
                researchCanBeResearched = true;
              }
            }),
            shareReplay(1),
          );
        }
        return {
          resource: gameContext.allResources.getElement(key),
          count: Math.ceil(research.cost[key] * Math.pow(1.2, level)),
          isOk$,
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
      blockersStatus: blockers,
      blockedUntil,
      timeBeforeUnlock,
    };
    this.allShowableResearchs.addElement(research.name, showable);
    this.allShowableResearchs$.next(this.allShowableResearchs);
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
  costNextLevel: Dictionnary<string, IResourceNeed>;
  bonusResourceCurrentLevel: Dictionnary<string, IResourceCount>;
  bonusResourceNextLevel: Dictionnary<string, IResourceCount>;
  bonusBuildingCostsCurrentLevel: Dictionnary<string, IResourceCount>;
  bonusBuildingCostsNextLevel: Dictionnary<string, IResourceCount>;
  blockersStatus: IBlockerStatus[];
  timeBeforeUnlock: Observable<number>;
}
