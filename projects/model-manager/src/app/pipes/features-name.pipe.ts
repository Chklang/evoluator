import { Pipe, PipeTransform } from '@angular/core';
import { IFeature } from 'game-engine';

@Pipe({
  name: 'featuresName'
})
export class FeaturesNamePipe implements PipeTransform {

  transform(values: IFeature[]): string[] {
    return (values || []).map(e => e.name);
  }

}
