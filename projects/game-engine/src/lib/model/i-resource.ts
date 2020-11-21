export interface IResource {
    name: string;
    icon: string;
    blockedBy: Record<string, number>;
    max: number;
    min?: number;
    resourceType: 'CLASSIC' | 'POPULATION' | 'RESEARCH';
    // TODO Need to implements resource consumption
    consumeType?: 'FOR_PRODUCTION' | 'FOR_LIVE';
    selfGrow?: number;
    growType?: 'CLASSIC' | 'EXPONENTIAL';
    consume: Record<string, number>;
    produce: Record<string, number>;
}
