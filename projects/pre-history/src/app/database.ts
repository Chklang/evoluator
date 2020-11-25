import { Dictionnary } from 'arrayplus';
import { IResourceBlocker } from 'game-engine';
import { IBuilding, IGame, IResource, IFeature } from 'game-engine';

export const resources: IResource[] = [
    {
        name: 'population',
        icon: 'user',
        blockedBy: [],
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
        icon: 'tree',
        blockedBy: [],
        max: 100,
        resourceType: 'CLASSIC',
        consume: {},
        produce: {},
    },
    {
        name: 'food',
        icon: 'cutlery',
        blockedBy: [],
        max: 100,
        resourceType: 'CLASSIC',
        consume: {},
        produce: {},
    },
];
export const buildings: IBuilding[] = [
    {
        name: 'Scierie',
        blockedBy: [],
        consume: {},
        produce: {
            wood: 34,
        },
        storage: {
            wood: 300,
        },
        cost: {},
    },
    {
        name: 'Ferme',
        blockedBy: [],
        consume: {},
        produce: {
            food: 1,
        },
        storage: {},
        cost: {},
    },
];

export const features: IFeature[] = [
    {
        name: 'Research', blockedBy: [
            { type: 'resource', params: { name: 'population', quantity: 5}} as IResourceBlocker,
        ],
    },
];

export const gameFromScratch: IGame = {
    time: Date.now(),
    resources: {
        population: { quantity: 4, max: 1, icon: 'user' },
    },
    buildings: {
        Scierie: 2,
        Ferme: 1,
    },
    showableElements: {
        buildings: Dictionnary.create(),
        resources: Dictionnary.create(),
        features: Dictionnary.create(),
    },
    calculated: {
        nextEvent: 0,
        production: {},
    },
};


export const buildingsByKey: Record<string, IBuilding> = {};
buildings.forEach((building) => {
    buildingsByKey[building.name] = building;
});

export const resourcesByKey: Record<string, IResource> = {};
resources.forEach((resource) => {
    resourcesByKey[resource.name] = resource;
});
