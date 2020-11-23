export interface IBuilding {
    name: string;
    blockedBy: Record<string, number>;
    consume: Record<string, number>;
    produce: Record<string, number>;
    storage: Record<string, number>;
    cost: Record<string, number>;
}
