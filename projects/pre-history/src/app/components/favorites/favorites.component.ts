import { Component, OnInit } from '@angular/core';
import { FavoritesService, IFavorite, IFavoriteBuilding, IFavoriteResearch, StoreService } from 'game-engine';
import { IResourceNeed, EFavoriteType } from 'game-engine';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
                    }).concat(element.maintenanceNextLevel.map((maintenance) => {
                      return maintenance.isOk$;
                    }))).pipe(
                      map((costs) => costs.reduce((prev, curr) =>
                        (prev === 0 || curr === 0) ? 0 : Math.max(prev, curr), -1)
                      ),
                    ),
                    actionPlus: () => {
                      this.backgroundActionsService.execute(this.storeService.build(element.building));
                    },
                    canActionMoins: element.count > 0,
                    actionMoins: () => {
                      this.backgroundActionsService.execute(this.storeService.destroy(element.building));
                    },
                    remove: () => {
                      this.backgroundActionsService.execute(this.storeService.removeBuildingFromFavorites(element.building));
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
                    actionPlus: () => {
                      this.backgroundActionsService.execute(this.storeService.research(element.research));
                    },
                    canActionMoins: false,
                    remove: () => {
                      this.backgroundActionsService.execute(this.storeService.removeResearchFromFavorites(element.research));
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
  actionPlus: () => void;
  actionMoins?: () => void;
  canActionMoins: boolean;
  remove: () => void;
}
