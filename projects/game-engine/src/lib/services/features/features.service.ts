import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { IBlocker, IFeature } from '../../model';
import { IBlockerStatus } from '../../model/i-blocker-status';
import { ICalculatedGameContext } from '../store/store.service';

@Injectable({
  providedIn: 'root'
})
export class FeaturesService {
  private showableFeatures: Record<string, Subject<IShowableFeature>> = {};

  constructor() { }

  public listenFeature(Feature: IFeature): Observable<IShowableFeature> {
    if (!this.showableFeatures[Feature.name]) {
      this.showableFeatures[Feature.name] = new ReplaySubject(1);
    }
    return this.showableFeatures[Feature.name];
  }

  public setFeature(gameContext: ICalculatedGameContext, feature: IFeature, blockedBy: IBlocker<any>[], blockedUntil: number): void {
    const showable: IShowableFeature = {
      feature,
      blockersStatus: (feature.blockedBy || []).map((blocker): IBlockerStatus => {
        return {
          blocker,
          isOk: blockedBy.indexOf(blocker) === -1,
        };
      }),
      blockedUntil,
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
}
