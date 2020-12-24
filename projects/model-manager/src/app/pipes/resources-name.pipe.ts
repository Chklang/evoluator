import { Pipe, PipeTransform } from '@angular/core';
import { IResource } from 'game-engine';

@Pipe({
  name: 'resourcesName'
})
export class ResourcesNamePipe implements PipeTransform {

  transform(values: IResource[]): string[] {
    return (values || []).map(e => e.name);
  }

}
