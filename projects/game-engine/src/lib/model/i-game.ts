import { Dictionnary } from 'arrayplus';
import { IResource } from './i-resource';
import { IBuilding } from './i-building';
import { IFeature } from './i-feature';
import { IResearch } from './i-research';

export interface IGame {
    time: number;
    resources: Record<string, { quantity: number; max: number; icon: string; }>;
    buildings: Record<string, number>;
    researchs: Record<string, number>;
    favorites: { type: string, name: string }[];
    showableElements: {
        resources: Dictionnary<string, IResource>;
        buildings: Dictionnary<string, IBuilding>;
        features: Dictionnary<string, IFeature>;
        researchs: Dictionnary<string, IResearch>;
    };
    calculated: IGameEvolutionStatus;
}

export interface IGameEvolutionStatus {
    nextEvent: number;
    production: Record<string, number>;
    unlockFeature?: IChainedUnlock<IFeature>;
    unlockResearch?: IChainedUnlock<IResearch>;
    unlockBuilding?: IChainedUnlock<IBuilding>;
}

export interface IChainedUnlock<T> {
    time: number;
    element: T;
    nextUnlock?: IChainedUnlock<T>;
}
