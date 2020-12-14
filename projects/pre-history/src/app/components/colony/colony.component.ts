import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BuildingsService,
  EFavoriteType,
  FavoritesService,
  IFavorite,
  IShowableBuilding,
  StoreService,
  IFavoriteBuilding,
  IResource,
} from 'game-engine';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { resourcesByKey } from '../../database';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.component.html',
  styleUrls: ['./colony.component.css']
})
export class ColonyComponent implements OnInit {
  public buildingsToShow$: Observable<IBuildingDetails[]>;
  public JSON = JSON;
  public resourceSelectedName: string | undefined;
  public resourceSelected: IResource | undefined;
  public readonly CAN_BE_GENERATED: Record<string, boolean> = {
    wood: true,
    food: true,
  };

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    public readonly storeService: StoreService,
    public readonly backgroundAction: BackgroundActionsService,
    private readonly buildingsService: BuildingsService,
    public readonly favoritesService: FavoritesService,
  ) { }

  public ngOnInit(): void {
    this.buildingsToShow$ = this.activatedRoute.paramMap.pipe(
      switchMap((params): Observable<[IShowableBuilding[], IFavorite<any>[]]> => {
        this.resourceSelected = undefined;
        this.resourceSelectedName = undefined;
        if (!params.has('selectedResource')) {
          return of([[], []]);
        }
        const selectedResource = params.get('selectedResource');
        if (!resourcesByKey[selectedResource]) {
          return of([[], []]);
        }
        this.resourceSelected = resourcesByKey[selectedResource];
        this.resourceSelectedName = this.resourceSelected.name;
        return combineLatest([
          this.buildingsService.listenBuildingByResource(this.resourceSelected),
          this.favoritesService.favorites$,
        ]);
      }),
      map(([buildings, favorites]): IBuildingDetails[] => {
        const onlyBuildings: IFavoriteBuilding[] = favorites.filter(e => e.type === EFavoriteType.BUILDING) as IFavoriteBuilding[];
        return buildings.map((currentBuilding) => ({
            infos: currentBuilding,
            isFavorite: onlyBuildings.find(e => e.id === FavoritesService.generateBuildingId(currentBuilding.building)) !== undefined,
        }));
      }),
    );
  }

  public buildingTrackByFn(index: number, building: IBuildingDetails): string {
    return building.infos.building.name;
  }

  public resourceTrackByFn(index: number, resource: IResource): string {
    return resource.name;
  }


}

export interface IBuildingDetails {
  infos: IShowableBuilding;
  isFavorite: boolean;
}
