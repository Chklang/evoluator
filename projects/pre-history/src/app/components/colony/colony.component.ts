import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildingsService, IShowableBuilding, StoreService } from 'game-engine';
import { IResource } from 'projects/game-engine/src/lib/model';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { resourcesByKey } from '../../database';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.component.html',
  styleUrls: ['./colony.component.css']
})
export class ColonyComponent implements OnInit {
  public buildingsToShow$: Observable<IShowableBuilding[]>;
  public JSON = JSON;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    public readonly storeService: StoreService,
    public readonly backgroundAction: BackgroundActionsService,
    private readonly buildingsService: BuildingsService,
  ) { }

  public ngOnInit(): void {
    this.buildingsToShow$ = this.activatedRoute.paramMap.pipe(
      switchMap((params) => {
        if (!params.has('selectedResource')) {
          return of([]);
        }
        const selectedResource = params.get('selectedResource');
        if (!resourcesByKey[selectedResource]) {
          return of([]);
        }
        return this.buildingsService.listenBuildingByResource(resourcesByKey[selectedResource]);
      }),
      tap((e) => console.log('Buildings : ', e)),
    );
  }

  public buildingTrackByFn(index: number, building: IShowableBuilding): string {
    return building.building.name;
  }

  public resourceTrackByFn(index: number, resource: IResource): string {
    return resource.name;
  }


}
