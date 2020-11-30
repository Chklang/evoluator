import { Dictionnary } from 'arrayplus';
import { IAchievement, IResearch, IResourceBlocker } from 'game-engine';
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
            wood: 5,
        },
        storage: {},
        cost: {
            wood: 30,
        },
    },
    {
        name: 'EntrepotsBois',
        blockedBy: [],
        consume: {},
        produce: {},
        storage: {
            wood: 300,
        },
        cost: {
            wood: 80,
        },
    },
    {
        name: 'Ferme',
        blockedBy: [],
        consume: {},
        produce: {
            food: 1,
        },
        storage: {},
        cost: {
            wood: 10,
        },
    },
];

export const features: IFeature[] = [
    {
        name: 'Research', blockedBy: [
            { type: 'resource', params: { name: 'population', quantity: 5 } } as IResourceBlocker,
        ],
    },
];

export const researchs: IResearch[] = [
    {
        name: 'axe',
        bonusBuildingCosts: {},
        bonusResources: {
            wood: 1.1,
        },
        cost: {
            wood: 120,
        },
    }
];

export const achievements: IAchievement[] = [
    {
        name: 'createWood',
        levels: [
            {
                level: 0, blockers: [
                    { type: 'resourceTotal', params: { name: 'wood', quantity: 1000 } },
                ]
            },
            {
                level: 1, blockers: [
                    { type: 'resourceTotal', params: { name: 'wood', quantity: 50000 } },
                ]
            },
            {
                level: 2, blockers: [
                    { type: 'resourceTotal', params: { name: 'wood', quantity: 1_000_000 } },
                ]
            },
        ]
    }
];

export const gameFromScratch: IGame = {
    time: Date.now(),
    resources: {
        population: { quantity: 1, max: 1, icon: 'user' },
    },
    buildings: {
        Scierie: 2,
        Ferme: 1,
    },
    researchs: {},
    favorites: [],
    achievements: {},
    resourcesTotal: {},
    buildingsMax: {},
    researchsMax: {},
    showableElements: {
        buildings: Dictionnary.create(),
        resources: Dictionnary.create(),
        features: Dictionnary.create(),
        researchs: Dictionnary.create(),
        achievements: Dictionnary.create(),
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

export const featuresByKey: Record<string, IFeature> = {};
features.forEach((feature) => {
    featuresByKey[feature.name] = feature;
});

export const researchsByKey: Record<string, IResearch> = {};
researchs.forEach((research) => {
    researchsByKey[research.name] = research;
});
