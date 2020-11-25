import { Dictionnary } from 'arrayplus';
import { IResource } from './i-resource';
import { IBuilding } from './i-building';
import { IFeature } from './i-feature';

export interface IGame {
    time: number;
    resources: Record<string, { quantity: number; max: number; icon: string; }>;
    buildings: Record<string, number>;
    showableElements: {
        resources: Dictionnary<string, IResource>;
        buildings: Dictionnary<string, IBuilding>;
        features: Dictionnary<string, IFeature>;
    };
    calculated: IGameEvolutionStatus;
}

export interface IGameEvolutionStatus {
    nextEvent: number;
    production: Record<string, number>;
    unlockFeature?: IChainedFeatureUnlock;
}

export interface IChainedFeatureUnlock {
    time: number;
    feature: IFeature;
    nextUnlock?: IChainedFeatureUnlock;
}
