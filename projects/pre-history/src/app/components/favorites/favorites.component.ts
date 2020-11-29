import { Component, OnInit } from '@angular/core';
import { BuildingsService, FavoritesService, IFavorite, IFavoriteBuilding, IFavoriteResearch, ResearchsService, StoreService } from 'game-engine';
import { IResourceNeed, EFavoriteType } from 'game-engine';
import { combineLatest, forkJoin, Observable, of, zip } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  public favorites$: Observable<IFavoriteToShow[]>;

  constructor(
    public readonly favoritesService: FavoritesService,
    public readonly storeService: StoreService,
    public readonly backgroundActionsService: BackgroundActionsService,
  ) { }

  public ngOnInit(): void {
    this.favorites$ = this.favoritesService.favorites$.pipe(
      switchMap((favorites) => {
        if (favorites.length === 0) {
          return of([]);
        }
        return combineLatest(favorites.map((favorite): Observable<IFavoriteToShow> => {
          switch (favorite.type) {
            case EFavoriteType.BUILDING: {
              const favoriteTyped = favorite as IFavoriteBuilding;
              return favoriteTyped.element.pipe(
                map((element): IFavoriteToShow => {
                  return {
                    name: 'buildings.' + element.building.name + '.name',
                    id: favoriteTyped.id,
                    cost: element.costNextLevel,
                    buttonText: 'build',
                    timeBeforeUnlock: combineLatest(element.costNextLevel.map((cost) => {
                      return cost.isOk$;
                    })).pipe(
                      map((costs) => costs.reduce((prev, curr) =>
                        (prev === 0 || curr === 0) ? 0 : Math.max(prev, curr), -1)
                      ),
                    ),
                    action: () => {
                      this.backgroundActionsService.execute(this.storeService.build(element.building));
                    },
                    remove: () => {
                      this.favoritesService.removeBuildingFromFavorites(element.building);
                    },
                  };
                }),
              );
            }
            case EFavoriteType.RESEARCH: {
              const favoriteTyped = favorite as IFavoriteResearch;
              return favoriteTyped.element.pipe(
                map((element): IFavoriteToShow => {
                  return {
                    name: 'researchs.' + element.research.name + '.name',
                    id: favoriteTyped.id,
                    cost: element.costNextLevel,
                    buttonText: 'research',
                    timeBeforeUnlock: combineLatest(element.costNextLevel.map((cost) => {
                      return cost.isOk$;
                    })).pipe(
                      map((costs) => costs.reduce((prev, curr) =>
                        (prev === 0 || curr === 0) ? 0 : Math.max(prev, curr), -1)
                      ),
                    ),
                    action: () => {
                      this.backgroundActionsService.execute(this.storeService.research(element.research));
                    },
                    remove: () => {
                      this.favoritesService.removeResearchFromFavorites(element.research);
                    },
                  };
                }),
              );
            }
          }
        }));
      }),
    );
  }

  public favoriteTrackByFn(index: number, favorite: IFavorite<any>): string {
    return favorite.id;
  }
}

export interface IFavoriteToShow {
  id: string;
  name: string;
  buttonText: string;
  timeBeforeUnlock: Observable<number>;
  cost: IResourceNeed[];
  action: () => void;
  remove: () => void;
}
