import { Component, OnInit } from '@angular/core';
import { EFavoriteType, FavoritesService, IFavoriteResearch, IGame, IShowableResearch, ResearchsService, StoreService } from 'game-engine';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-researchs',
  templateUrl: './researchs.component.html',
  styleUrls: ['./researchs.component.css']
})
export class ResearchsComponent implements OnInit {
  public readonly datas$: Observable<IGame>;
  public researchsToShow$: Observable<IResearchetails[]>;

  constructor(
    public readonly storeService: StoreService,
    public readonly researchsService: ResearchsService,
    public readonly backgroundAction: BackgroundActionsService,
    public readonly favoritesService: FavoritesService,
  ) {
    this.datas$ = this.storeService.datas$;
  }

  public ngOnInit(): void {
    this.researchsToShow$ = combineLatest([
      this.researchsService.allShowableResearchs$,
      this.favoritesService.favorites$,
    ]).pipe(
      map(([researchs, favorites]): IResearchetails[] => {
        const onlyResearchs: IFavoriteResearch[] = favorites.filter(e => e.type === EFavoriteType.RESEARCH) as IFavoriteResearch[];
        return researchs.map((currentResearchs) => ({
          infos: currentResearchs,
          isFavorite: onlyResearchs.find(e => e.id === FavoritesService.generateResearchId(currentResearchs.research)) !== undefined,
        }));
      }),
    );
  }

  public researchTrackByFn(index: number, research: IResearchetails): string {
    return research.infos.research.name;
  }
}

export interface IResearchetails {
  infos: IShowableResearch;
  isFavorite: boolean;
}
