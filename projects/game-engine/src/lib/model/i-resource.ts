import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IResource {
    name: string;
    icon: string;
    blockedBy?: IBlocker<any>[];
    max: number;
    min?: number;
    resourceType: 'CLASSIC' | 'POPULATION' | 'RESEARCH';
    selfGrow?: number;
    growType?: 'CLASSIC' | 'EXPONENTIAL';
}

export function createDictionnaryResource(elements: IResource[]): Dictionnary<string, IResource> {
    const dict = Dictionnary.create((e: IResource) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
