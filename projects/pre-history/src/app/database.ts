import { IBuilding, IGame, IResource } from 'game-motor';

export const resources: IResource[] = [
    {
        name: 'population',
        blockedBy: {},
        max: 10,
        min: 1,
        resourceType: 'POPULATION',
        consumeType: 'FOR_LIVE',
        selfGrow: 1.01,
        growType: 'EXPONENTIAL',
        consume: {
            food: 0.1,
        },
        produce: {},
    },
    {
        name: 'wood',
        blockedBy: {},
        max: 100,
        resourceType: 'CLASSIC',
        consume: {},
        produce: {},
    },
    {
        name: 'food',
        blockedBy: {},
        max: 100,
        resourceType: 'CLASSIC',
        consume: {},
        produce: {},
    },
];
export const buildings: IBuilding[] = [
    {
        name: 'Scierie',
        blockedBy: {},
        consume: {},
        produce: {
            wood: 34,
        },
        storage: {
            wood: 300,
        },
    },
    {
        name: 'Ferme',
        blockedBy: {},
        consume: {},
        produce: {
            food: 1,
        },
        storage: {},
    },

];

export const gameFromScratch: IGame = {
    time: Date.now(),
    resources: {
        population: { quantity: 1, max: 1 },
    },
    buildings: {
        Scierie: 2,
        Ferme: 1,
    },
    showableElements: {
        buildings: [],
        resources: [],
    },
    calculated: {
        nextEvent: 0,
        production: {},
    },
};
