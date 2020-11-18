export interface IGame {
    time: number;
    resources: Record<string, { quantity: number; max: number; }>;
    buildings: Record<string, number>;
    showableElements: {
        resources: string[];
        buildings: string[];
    };
    calculated: IGameEvolutionStatus;
}

export interface IGameEvolutionStatus {
    nextEvent: number;
    production: Record<string, number>;
}
