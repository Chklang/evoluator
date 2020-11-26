import { IBlocker } from './i-blocker';

export interface IBlockerStatus {
    blocker: IBlocker<any>;
    isOk: boolean;
}
