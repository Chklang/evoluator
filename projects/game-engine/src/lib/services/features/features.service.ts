import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, takeWhile, tap } from 'rxjs/operators';
import {
  IBlocker,
  IFeature,
  IBlockerStatus
} from '../../model';
import { ICalculatedGameContext } from '../store/i-calculated-game-context';
import { TickService } from '../tick/tick.service';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  private showableFeatures: Record<string, Subject<IShowableFeature>> = {};

  constructor(
    private readonly tickService: TickService,
  ) { }

  public listenFeature(Feature: IFeature): Observable<IShowableFeature> {
    if (!this.showableFeatures[Feature.name]) {
      this.showableFeatures[Feature.name] = new ReplaySubject(1);
    }
    return this.showableFeatures[Feature.name];
  }

  public setFeature(gameContext: ICalculatedGameContext, feature: IFeature, blockedBy: IBlocker<any>[], blockedUntil: number): void {
    const blockers = (feature.blockedBy || []).map((blocker): IBlockerStatus => {
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
    const showable: IShowableFeature = {
      feature,
      blockersStatus: blockers,
      blockedUntil,
      timeBeforeUnlock,
    };
    if (!this.showableFeatures[feature.name]) {
      this.showableFeatures[feature.name] = new BehaviorSubject(showable);
    } else {
      this.showableFeatures[feature.name].next(showable);
    }
  }
}

export interface IShowableFeature {
  feature: IFeature;
  blockedUntil: number;
  blockersStatus: IBlockerStatus[];
  timeBeforeUnlock: Observable<number>;
}
