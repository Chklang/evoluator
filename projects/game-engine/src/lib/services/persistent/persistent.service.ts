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
      version: 2,
      buildings: {},
      researchs: {},
      resources: {},
      features: [],
      favorites: [],
      achievements: {},
      buildingsMax: {},
      researchsMax: {},
      resourcesTotal: {},
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
    game.showableElements.achievements.forEach((achievement) => {
      result.achievements[achievement.name] = game.achievements[achievement.name] || 0;
    });
    result.favorites = game.favorites.map((favoriteName) => favoriteName); // Clone array
    Object.keys(game.buildingsMax).forEach((buildingName) => {
      result.buildingsMax[buildingName] = game.buildingsMax[buildingName];
    });
    Object.keys(game.researchsMax).forEach((researchName) => {
      result.researchsMax[researchName] = game.researchsMax[researchName];
    });
    Object.keys(game.resourcesTotal).forEach((resourceName) => {
      result.resourcesTotal[resourceName] = game.resourcesTotal[resourceName];
    });
    localStorage.setItem('evoluator-save', JSON.stringify(result));
    return of(game);
  }

  public load(gameContext: ICalculatedGameContext): Observable<IGame> {
    return defer(() => {
      if (!localStorage.getItem('evoluator-save')) {
        return of(gameContext.gameFromScratch);
      }
      const saved: IGameSerialized = JSON.parse(localStorage.getItem('evoluator-save'));
      switch (saved.version) {
        case 1:
          saved.buildingsMax = {};
          saved.researchsMax = {};
          saved.resourcesTotal = {};
          saved.achievements = {};
          // NO BREAK! execute updates of next versions
          // tslint:disable-next-line:no-switch-case-fall-through
        case 2:
          // Current version, nothing to do
          break;
        default:
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
        achievements: {},
        buildingsMax: {},
        researchsMax: {},
        resourcesTotal: {},
        showableElements: {
          buildings: Dictionnary.create(),
          features: Dictionnary.create(),
          researchs: Dictionnary.create(),
          resources: Dictionnary.create(),
          achievements: Dictionnary.create(),
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
      Object.keys(saved.achievements).forEach((achievementName) => {
        game.achievements[achievementName] = saved.achievements[achievementName];
        game.showableElements.achievements.addElement(achievementName, gameContext.allAchievements.getElement(achievementName));
      });
      game.favorites = saved.favorites.map((favoriteName) => favoriteName); // Clone array
      Object.keys(saved.buildingsMax).forEach((buildingName) => {
        game.buildingsMax[buildingName] = saved.buildingsMax[buildingName];
      });
      Object.keys(saved.researchsMax).forEach((researchName) => {
        game.researchsMax[researchName] = saved.researchsMax[researchName];
      });
      Object.keys(saved.resourcesTotal).forEach((resourceName) => {
        game.resourcesTotal[resourceName] = saved.resourcesTotal[resourceName];
      });
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
  resourcesTotal: Record<string, number>;
  buildingsMax: Record<string, number>;
  researchsMax: Record<string, number>;
  features: string[];
  favorites: { type: string, name: string }[];
  achievements: Record<string, number>;
  time: number;
}
