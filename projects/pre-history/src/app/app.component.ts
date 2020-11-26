import { Component, OnInit } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { FeaturesService, LangsService, StoreService } from 'game-engine';
import { buildings, resources, gameFromScratch, features, researchs, featuresByKey } from './database';
import { BackgroundActionsService } from './services/background-actions/background-actions.service';
import { combineAll, map, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public canResearch: Observable<number>;
  public constructor(
    private readonly storeService: StoreService,
    private readonly featureService: FeaturesService,
    public readonly langsService: LangsService,
    public readonly backgroundAction: BackgroundActionsService,
  ) { }

  public ngOnInit(): void {
    this.storeService.init({
      allBuildings: buildings,
      allResources: resources,
      allFeatures: features,
      allResearchs: researchs,
      gameFromScratch,
    });
    let featureIsDeblocked = false;
    this.canResearch = this.featureService.listenFeature(featuresByKey.Research).pipe(
      switchMap((feature) => {
        return interval(1000).pipe(
          takeWhile(() => !featureIsDeblocked),
          map(() => feature),
        );
      }),
      map((showable) => {
        if (showable.blockedUntil === +Infinity) {
          return 0;
        }
        const value = showable.blockedUntil - Date.now();
        if (value <= 0) {
          featureIsDeblocked = true;
          return -1;
        }
        return value;
      }),
    );
    this.storeService.start();
  }
}
