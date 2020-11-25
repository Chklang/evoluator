import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IBuilding {
    name: string;
    blockedBy?: IBlocker<any>[];
    consume: Record<string, number>;
    produce: Record<string, number>;
    storage: Record<string, number>;
    cost: Record<string, number>;
}

export function createDictionnaryBuilding(elements: IBuilding[]): Dictionnary<string, IBuilding> {
    const dict = Dictionnary.create((e: IBuilding) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
