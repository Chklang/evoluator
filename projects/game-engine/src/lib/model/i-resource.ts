import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IResource {
    name: string;
    icon: string;
    blockedBy?: IBlocker<any>[];
    max: number;
    min?: number;
    resourceType: 'CLASSIC' | 'POPULATION' | 'RESEARCH';
    // TODO Need to implements resource consumption
    consumeType?: 'FOR_PRODUCTION' | 'FOR_LIVE';
    selfGrow?: number;
    growType?: 'CLASSIC' | 'EXPONENTIAL';
    consume?: Record<string, number>;
    produce?: Record<string, number>;
}

export function createDictionnaryResource(elements: IResource[]): Dictionnary<string, IResource> {
    const dict = Dictionnary.create((e: IResource) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
