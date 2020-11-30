import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FeaturesService, LangsService, StoreService } from 'game-engine';
import { buildings, resources, gameFromScratch, features, researchs, featuresByKey, achievements } from './database';
import { BackgroundActionsService } from './services/background-actions/background-actions.service';
import { switchMap } from 'rxjs/operators';

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
      allAchievements: achievements,
      gameFromScratch,
    });
    this.canResearch = this.featureService.listenFeature(featuresByKey.Research).pipe(
      switchMap((obs) => obs.timeBeforeUnlock),
    );
    this.storeService.start();
  }
}
