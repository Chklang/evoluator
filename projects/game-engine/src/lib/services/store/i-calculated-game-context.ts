import { Dictionnary } from 'arrayplus';
import { IBuilding, IFeature, IGame, IResearch, IResource } from '../../model';

export interface ICalculatedGameContext {
    allResources: Dictionnary<string, IResource>;
    allBuildings: Dictionnary<string, IBuilding>;
    allFeatures: Dictionnary<string, IFeature>;
    allResearchs: Dictionnary<string, IResearch>;
    gameFromScratch: IGame;
}
