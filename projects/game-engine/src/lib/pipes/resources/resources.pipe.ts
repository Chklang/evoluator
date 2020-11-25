import { Pipe, PipeTransform } from '@angular/core';
import { IResource } from '../../model';
import { IGame } from '../../model/i-game';

@Pipe({
  name: 'resources'
})
export class ResourcesPipe implements PipeTransform {

  transform(game: IGame | null, resource: IResource, withMax: boolean): string {
    let quantity = 0;
    let max = 0;
    if (game && game.resources[resource.name]) {
      quantity = game.resources[resource.name].quantity;
      max = game.resources[resource.name].max;
    }
    quantity = this.formatNumber(quantity);
    max = this.formatNumber(max);
    if (withMax) {
      return '<span class="c-first">' + quantity + '</span> <small class="c-second">/' + max + '</small>';
    } else {
      return String(quantity);
    }
  }
  private formatNumber(value: number): number {
    const result = Math.floor(value * 1_000) / 1_000;
    return result;
  }

}
