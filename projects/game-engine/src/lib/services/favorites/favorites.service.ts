import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IBuilding, IResearch } from '../../model';
import { BuildingsService, IShowableBuilding } from '../buildings/buildings.service';
import { IShowableResearch, ResearchsService } from '../researchs/researchs.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favorites: Dictionnary<string, IFavorite<any>> = Dictionnary.create();
  public favorites$: Subject<IFavorite<any>[]> = new BehaviorSubject(this.favorites);

  constructor(
    private readonly buildingsService: BuildingsService,
    private readonly researchsService: ResearchsService,
  ) { }

  public addBuildingInFavorites(building: IBuilding): void {
    const id = EFavoriteType.BUILDING + '_' + building.name;
    if (this.favorites.hasElement(id)) {
      // Already in favorites
      return;
    }
    const newFavorite: IFavoriteBuilding = {
      id,
      type: EFavoriteType.BUILDING,
      element: this.buildingsService.listenBuilding(building),
    };
    this.favorites.addElement(id, newFavorite);
    this.favorites$.next(this.favorites);
  }

  public removeBuildingFromFavorites(building: IBuilding): void {
    this.removeFromFavorites(EFavoriteType.BUILDING + '_' + building.name);
  }

  public addResearchInFavorites(research: IResearch): void {
    const id = EFavoriteType.RESEARCH + '_' + research.name;
    if (this.favorites.hasElement(id)) {
      // Already in favorites
      return;
    }
    const newFavorite: IFavoriteResearch = {
      id,
      type: EFavoriteType.RESEARCH,
      element: this.researchsService.listenResearch(research),
    };
    this.favorites.addElement(id, newFavorite);
    this.favorites$.next(this.favorites);
  }

  public removeResearchFromFavorites(research: IResearch): void {
    this.removeFromFavorites(EFavoriteType.RESEARCH + '_' + research.name);
  }

  private removeFromFavorites(id: string): void {
    if (!this.favorites.hasElement(id)) {
      // Not in favorites
      return;
    }
    this.favorites.removeElement(id);
    this.favorites$.next(this.favorites);
  }
}

export enum EFavoriteType {
  BUILDING = 'BUILDING',
  RESEARCH = 'RESEARCH',
}
export interface IFavorite<T> {
  id: string;
  type: EFavoriteType;
  element: Observable<T>;
}

export interface IFavoriteBuilding extends IFavorite<IShowableBuilding> {
  type: EFavoriteType.BUILDING;
}

export interface IFavoriteResearch extends IFavorite<IShowableResearch> {
  type: EFavoriteType.RESEARCH;
}
