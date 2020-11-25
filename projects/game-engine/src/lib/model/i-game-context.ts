import { IBuilding } from './i-building';
import { IFeature } from './i-feature';
import { IGame } from './i-game';
import { IResource } from './i-resource';

export interface IGameContext {
    allResources: IResource[];
    allBuildings: IBuilding[];
    allFeatures: IFeature[];
    gameFromScratch: IGame;
}
