import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IBuilding, StoreService } from 'game-engine';
import { IResource } from 'projects/game-engine/src/lib/model';
import { Observable, of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { buildings, buildingsByKey, gameFromScratch, resources, resourcesByKey } from '../../database';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.component.html',
  styleUrls: ['./colony.component.css']
})
export class ColonyComponent implements OnInit {
  public buildingsToShow: Observable<IBuildingToShow[]>;
  public JSON = JSON;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    public readonly storeService: StoreService,
    public readonly backgroundAction: BackgroundActionsService,
  ) { }

  public ngOnInit(): void {
    this.buildingsToShow = this.activatedRoute.paramMap.pipe(
      switchMap((params) => {
        if (!params.has('selectedResource')) {
          return of([]);
        }
        return this.storeService.datas$.pipe(
          map((datas) => {
            const selectedResource = params.get('selectedResource');
            return datas.showableElements.buildings
              // TODO optimize it with precalculated datas
              .filter((building) => buildingsByKey[building].produce[selectedResource] !== undefined)
              .map((building): IBuildingToShow => {
                const cost: IBuildingToShowCost[] = Object.keys(buildingsByKey[building].cost).map((costKey): IBuildingToShowCost => ({
                  resource: resourcesByKey[costKey],
                  count: buildingsByKey[building].cost[costKey],
                }));

                return {
                  count: datas.buildings[building] || 0,
                  type: buildingsByKey[building],
                  cost,
                };
              });
          }),
        );
      }),
    );
  }

  public buildingTrackByFn(index: number, building: IBuildingToShow): string {
    return building.type.name;
  }

  public resourceTrackByFn(index: number, resource: IResource): string {
    return resource.name;
  }


}

interface IBuildingToShow {
  type: IBuilding;
  cost: IBuildingToShowCost[];
  count: number;
}
interface IBuildingToShowCost {
  resource: IResource;
  count: number;
}
