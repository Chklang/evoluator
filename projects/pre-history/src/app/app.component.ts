import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LangsService, StoreService } from 'game-engine';
import { buildings, resources, gameFromScratch, features, researchs } from './database';
import { BackgroundActionsService } from './services/background-actions/background-actions.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public canResearch: Observable<number>;
  public constructor(
    private storeService: StoreService,
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
    this.canResearch = this.storeService.datas$.pipe(
      map((datas) => {
        if (datas.showableElements.features.hasElement('Research')) {
          return -1;
        }
        let timeUnlock: number | undefined;
        let currentUnlockFeature = datas.calculated.unlockFeature;
        while (timeUnlock === undefined && currentUnlockFeature !== undefined) {
          if (currentUnlockFeature.element.name === 'Research') {
            timeUnlock = currentUnlockFeature.time;
          }
          currentUnlockFeature = currentUnlockFeature.nextUnlock;
        }
        if (timeUnlock !== undefined) {
          return timeUnlock - Date.now();
        }
        return 0;
      }),
    );
    this.storeService.start();
  }
}
