import { Component, OnInit } from '@angular/core';
import { IGame, IResearch, IResource, StoreService } from 'game-engine';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { resourcesByKey } from '../../database';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-researchs',
  templateUrl: './researchs.component.html',
  styleUrls: ['./researchs.component.css']
})
export class ResearchsComponent implements OnInit {
  public readonly datas$: Observable<IGame>;
  public researchsToShow$: Observable<IResearchToShow[]>;

  constructor(
    private storeService: StoreService,
    public readonly backgroundAction: BackgroundActionsService,
  ) {
    this.datas$ = this.storeService.datas$;
  }

  public ngOnInit(): void {
    this.researchsToShow$ = this.datas$.pipe(
      map((datas) => {
        return datas.showableElements.researchs.map((research): IResearchToShow => {
          const currentLevel = datas.researchs[research.name] || 0;
          return {
            type: research,
            cost: Object.keys(research.cost).map((costKey): IResearchToShowCost => {
              return {
                count: Math.ceil(research.cost[costKey] * Math.pow(1.2, currentLevel)),
                resource: resourcesByKey[costKey],
              };
            }),
            level: currentLevel,
            bonusResources: Object.keys(research.bonusResources).map((costKey): IResearchToShowCost => {
              return {
                count: Math.pow(research.bonusResources[costKey], currentLevel + 1),
                resource: resourcesByKey[costKey],
              };
            }),
          };
        });
      })
    );
  }

  public researchTrackByFn(index: number, research: IResearchToShow): string {
    return research.type.name;
  }
}

interface IResearchToShow {
  type: IResearch;
  cost: IResearchToShowCost[];
  bonusResources: IResearchToShowCost[];
  level: number;
}
interface IResearchToShowCost {
  resource: IResource;
  count: number;
}
