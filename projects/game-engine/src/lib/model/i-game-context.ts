import { IBuilding } from './i-building';
import { IGame } from './i-game';
import { IResource } from './i-resource';

export interface IGameContext {
    allResources: IResource[];
    allBuildings: IBuilding[];
    gameFromScratch: IGame;
}
