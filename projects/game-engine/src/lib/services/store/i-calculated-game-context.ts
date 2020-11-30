import { Dictionnary } from 'arrayplus';
import { IAchievement, IBuilding, IFeature, IGame, IResearch, IResource } from '../../model';

export interface ICalculatedGameContext {
    allResources: Dictionnary<string, IResource>;
    allBuildings: Dictionnary<string, IBuilding>;
    allFeatures: Dictionnary<string, IFeature>;
    allResearchs: Dictionnary<string, IResearch>;
    allAchievements: Dictionnary<string, IAchievement>;
    gameFromScratch: IGame;
}
