export interface IBlocker<IBlockerParams> {
    type: 'resource' | 'resourceTotal' | 'building' | 'feature';
    params: IBlockerParams;
}

export interface IResourceParamsBlocker {
    name: string;
    quantity: number;
}
export interface IResourceBlocker extends IBlocker<IResourceParamsBlocker> {
    type: 'resource';
}

export interface IFeatureParamsBlocker {
    name: string;
}
export interface IFeatureBlocker extends IBlocker<IFeatureParamsBlocker> {
    type: 'feature';
}

export interface IBuildingParamsBlocker {
    name: string;
    quantity: number;
}
export interface IBuildingBlocker extends IBlocker<IBuildingParamsBlocker> {
    type: 'building';
}
