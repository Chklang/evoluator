import { Type } from '@angular/core';
import { Dictionnary } from 'arrayplus';

export const modalesStore: Dictionnary<string, IModalDescriptor> = Dictionnary.create();

export function Modal(params: IModalDescriptor): any {
    // tslint:disable-next-line
    return function (constructor: { new(...args: any[]): any }): any {
        const result: any = class extends constructor {
            // tslint:disable-next-line:variable-name
            _type = params.type;
        };
        result.achievement = params.type;
        modalesStore.addElement(params.type, {
            type: params.type,
            component: result
        });
        return result;
    };
}

export interface IModalDescriptor {
    type: string;
    component: Type<any>;
}
