import { Pipe, PipeTransform } from '@angular/core';
import { IGame } from '../../model/i-game';

@Pipe({
  name: 'resources'
})
export class ResourcesPipe implements PipeTransform {

  transform(game: IGame | null, resource: string, withMax: boolean): string {
    let quantity = 0;
    let max = 0;
    if (game && game.resources[resource]) {
      quantity = game.resources[resource].quantity;
      max = game.resources[resource].max;
    }
    quantity = this.formatNumber(quantity);
    max = this.formatNumber(max);
    if (withMax) {
      return quantity + ' / ' + max;
    } else {
      return String(quantity);
    }
  }
  private formatNumber(value: number): number {
    const result = Math.floor(value * 1_000) / 1_000;
    return result;
  }

}
