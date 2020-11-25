export interface IBlocker<IBlockerParams> {
    type: 'resource' | 'building' | 'feature';
    params: IBlockerParams;
}

export interface IResourceParamsBlocker {
    name: string;
    quantity: number;
}
export interface IResourceBlocker extends IBlocker<IResourceParamsBlocker> {
    type: 'resource';
}
