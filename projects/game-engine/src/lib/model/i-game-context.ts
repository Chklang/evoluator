import { IBuilding } from './i-building';
import { IFeature } from './i-feature';
import { IGame } from './i-game';
import { IResearch } from './i-research';
import { IResource } from './i-resource';

export interface IGameContext {
    allResources: IResource[];
    allBuildings: IBuilding[];
    allFeatures: IFeature[];
    allResearchs: IResearch[];
    gameFromScratch: IGame;
}
