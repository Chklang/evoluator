import { Pipe, PipeTransform } from '@angular/core';
import { IBuilding } from 'game-engine';

@Pipe({
  name: 'buildingsName'
})
export class BuildingsNamePipe implements PipeTransform {

  transform(values: IBuilding[]): string[] {
    return (values || []).map(e => e.name);
  }

}
