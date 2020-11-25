import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IFeature {
    name: string;
    blockedBy?: IBlocker<any>[];
}

export function createDictionnaryFeature(elements: IFeature[]): Dictionnary<string, IFeature> {
    const dict = Dictionnary.create((e: IFeature) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
