import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IResearch {
    name: string;
    maxLevel?: number;
    cost: Record<string, number>;
    blockedBy?: IBlocker<any>[];
    bonusResources: Record<string, number>;
    bonusBuildingCosts: Record<string, number>;
    metadatas?: any;
}

export function createDictionnaryResearch(elements: IResearch[]): Dictionnary<string, IResearch> {
    const dict = Dictionnary.create((e: IResearch) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
