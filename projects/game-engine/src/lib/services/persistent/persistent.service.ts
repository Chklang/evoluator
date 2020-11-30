import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { defer, Observable, of, throwError } from 'rxjs';
import { IGame } from '../../model';
import { ICalculatedGameContext } from '../store/i-calculated-game-context';

@Injectable({
  providedIn: 'root'
})
export class PersistentService {

  constructor() { }

  public save(game: IGame): Observable<IGame> {
    const result: IGameSerialized = {
      version: 1,
      buildings: {},
      researchs: {},
      resources: {},
      features: [],
      favorites: [],
      time: game.time,
    };
    game.showableElements.buildings.forEach((building) => {
      result.buildings[building.name] = game.buildings[building.name] || 0;
    });
    result.features = game.showableElements.features.map((feature) => {
      return feature.name;
    });
    game.showableElements.researchs.forEach((research) => {
      result.researchs[research.name] = game.researchs[research.name] || 0;
    });
    game.showableElements.resources.forEach((resource) => {
      result.resources[resource.name] = game.resources[resource.name]?.quantity || 0;
    });
    result.favorites = game.favorites.map((favoriteName) => favoriteName); // Clone array
    localStorage.setItem('evoluator-save', JSON.stringify(result));
    return of(game);
  }

  public load(gameContext: ICalculatedGameContext): Observable<IGame> {
    return defer(() => {
      if (!localStorage.getItem('evoluator-save')) {
        return of(gameContext.gameFromScratch);
      }
      const saved: IGameSerialized = JSON.parse(localStorage.getItem('evoluator-save'));
      if (saved.version !== 1) {
        return throwError('Game cannot be loaded');
      }
      const game: IGame = {
        buildings: {},
        calculated: {
          nextEvent: 0,
          production: {},
        },
        researchs: {},
        resources: {},
        favorites: [],
        showableElements: {
          buildings: Dictionnary.create(),
          features: Dictionnary.create(),
          researchs: Dictionnary.create(),
          resources: Dictionnary.create(),
        },
        time: saved.time,
      };
      Object.keys(saved.buildings).forEach((buildingName) => {
        game.buildings[buildingName] = saved.buildings[buildingName];
        game.showableElements.buildings.addElement(buildingName, gameContext.allBuildings.getElement(buildingName));
      });
      Object.keys(saved.researchs).forEach((researchName) => {
        game.researchs[researchName] = saved.researchs[researchName];
        game.showableElements.researchs.addElement(researchName, gameContext.allResearchs.getElement(researchName));
      });
      Object.keys(saved.resources).forEach((resourceName) => {
        game.resources[resourceName] = {
          quantity: saved.resources[resourceName],
          icon: gameContext.allResources.getElement(resourceName).icon,
          max: gameContext.allResources.getElement(resourceName).max,
        };
        game.showableElements.resources.addElement(resourceName, gameContext.allResources.getElement(resourceName));
      });
      saved.features.forEach((featureName) => {
        game.showableElements.features.addElement(featureName, gameContext.allFeatures.getElement(featureName));
      });
      game.favorites = saved.favorites.map((favoriteName) => favoriteName); // Clone array
      return of(game);
    });
  }

  public reset(): void {
    localStorage.removeItem('evoluator-save');
    location.reload();
  }
}

interface IGameSerialized {
  version: number;
  resources: Record<string, number>;
  buildings: Record<string, number>;
  researchs: Record<string, number>;
  features: string[];
  favorites: { type: string, name: string }[];
  time: number;
}
