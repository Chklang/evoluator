import { Dictionnary } from 'arrayplus';
import { IBlocker } from './i-blocker';

export interface IAchievement {
    name: string;
    levels: IAchievementLevel[];
    metadatas?: any;
}

export interface IAchievementLevel {
    level: number;
    blockers: IBlocker<any>[];
}

export function createDictionnaryAchievements(elements: IAchievement[]): Dictionnary<string, IAchievement> {
    const dict = Dictionnary.create((e: IAchievement) => e.name);
    elements.forEach((e) => dict.addElement(e.name, e));
    return dict;
}
