import { Dictionnary } from 'arrayplus';
import { IResource } from './i-resource';
import { IBuilding } from './i-building';
import { IFeature } from './i-feature';
import { IResearch } from './i-research';
import { IAchievement } from './i-achievement';

export interface IGame {
    time: number;
    resources: Record<string, { quantity: number; min: number; max: number; icon: string; }>;
    buildings: Record<string, number>;
    researchs: Record<string, number>;
    favorites: { type: string, name: string }[];
    achievements: Record<string, number>;
    resourcesTotal: Record<string, number>;
    buildingsMax: Record<string, number>;
    researchsMax: Record<string, number>;
    showableElements: {
        resources: Dictionnary<string, IResource>;
        buildings: Dictionnary<string, IBuilding>;
        features: Dictionnary<string, IFeature>;
        researchs: Dictionnary<string, IResearch>;
        achievements: Dictionnary<string, IAchievement>;
    };
    calculated: IGameEvolutionStatus;
}

export interface IGameEvolutionStatus {
    nextEvent: number;
    production: Record<string, number>;
    unlockFeature?: IChainedUnlock<IFeature>;
    unlockResearch?: IChainedUnlock<IResearch>;
    unlockBuilding?: IChainedUnlock<IBuilding>;
    unlockAchievement?: IChainedUnlockWithLevel<IAchievement>;
}

export interface IChainedUnlock<T> {
    time: number;
    element: T;
    nextUnlock?: IChainedUnlock<T>;
}

export interface IChainedUnlockWithLevel<T> extends IChainedUnlock<T> {
    level: number;
    nextUnlock?: IChainedUnlockWithLevel<T>;
}
