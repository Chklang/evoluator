import { Component, OnInit } from '@angular/core';
import { IGame, IResearch, IResource, IShowableResearch, ResearchsService, StoreService } from 'game-engine';
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
    public readonly storeService: StoreService,
    public readonly researchsService: ResearchsService,
    public readonly backgroundAction: BackgroundActionsService,
  ) {
    this.datas$ = this.storeService.datas$;
  }

  public ngOnInit(): void {
  }

  public researchTrackByFn(index: number, research: IShowableResearch): string {
    return research.research.name;
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
