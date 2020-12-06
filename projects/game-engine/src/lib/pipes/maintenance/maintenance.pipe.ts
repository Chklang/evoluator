import { Pipe, PipeTransform } from '@angular/core';
import { IGame, IResource } from '../../model';

@Pipe({
  name: 'maintenance'
})
export class MaintenancePipe implements PipeTransform {

  transform(game: IGame, resource: IResource): string {
    const quantity = this.getQuantity(game, resource);
    if (!quantity) {
      return '';
    }
    return this.formatNumber(quantity) + ' <small class="c-second">min</small>';
  }

  private getQuantity(game: IGame, resource: IResource): number {
    if (!game.resources[resource.name]) {
      return 0;
    }
    return game.resources[resource.name].min;
  }

  private formatNumber(value: number): number {
    if (value >= 100) {
      return Math.round(value);
    } else if (value >= 10) {
      return Math.round(value * 10) / 10;
    } else {
      return Math.round(value * 100) / 100;
    }
  }

}
