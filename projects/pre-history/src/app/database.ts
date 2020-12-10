import { Dictionnary } from 'arrayplus';
import { IAchievement, IResearch, IResourceBlocker } from 'game-engine';
import { IBuilding, IGame, IResource, IFeature } from 'game-engine';

export const resources: IResource[] = [
    {
        name: 'population',
        icon: 'user',
        max: 10,
        resourceType: 'POPULATION',
        selfGrow: 1.01,
        growType: 'EXPONENTIAL',
    },
    {
        name: 'wood',
        icon: 'tree',
        max: 100,
        resourceType: 'CLASSIC',
    },
    {
        name: 'food',
        icon: 'cutlery',
        max: 100,
        resourceType: 'CLASSIC',
    },
];
export const buildings: IBuilding[] = [
    {
        name: 'Cave',
        cost: {
            wood: 10,
        },
        storage: {
            population: 10,
        },
    },
    {
        name: 'Scierie',
        produce: {
            wood: 5,
        },
        cost: {
            wood: 30,
        },
        maintenance: {
            population: 1,
        },
    },
    {
        name: 'EntrepotsBois',
        storage: {
            wood: 300,
        },
        cost: {
            wood: 80,
        },
    },
    {
        name: 'Ferme',
        produce: {
            food: 1,
        },
        cost: {
            wood: 10,
        },
        maintenance: {
            population: 1,
        },
    },
    {
        name: 'Attic',
        cost: {
            wood: 100,
        },
        storage: {
            food: 200,
        },
    },
];

export const researchFeature: IFeature = {
    name: 'Research',
    blockedBy: [
        { type: 'resource', params: { name: 'population', quantity: 5 } } as IResourceBlocker,
    ],
};

export const features: IFeature[] = [
    researchFeature,
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
    },
    {
        name: 'Seduction',
        bonusBuildingCosts: {},
        bonusResources: {
            population: 1.02,
        },
        cost: {
            food: 100,
        },
    },
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
        population: { quantity: 1, max: 1, icon: 'user', min: 1 },
    },
    buildings: {},
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
