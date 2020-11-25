import { Pipe, PipeTransform } from '@angular/core';
import { IGame, IResource } from '../../model';

@Pipe({
  name: 'production'
})
export class ProductionPipe implements PipeTransform {

  transform(game: IGame, resource: IResource): string {
    const quantity = this.getQuantity(game, resource);
    return this.formatNumber(quantity) + '/s';
  }

  private getQuantity(game: IGame, resource: IResource): number {
    if (!game.calculated.production[resource.name]) {
      return 0;
    }
    switch (resource.growType) {
      case 'CLASSIC':
        return game.calculated.production[resource.name];
      case 'EXPONENTIAL':
        const quantity = game.resources[resource.name]?.quantity || 0;
        return (game.calculated.production[resource.name] * quantity) - quantity;
    }
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
