import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {

  transform(value: number): string {
    const percent = Math.round(value * 100);
    if (percent > 100) {
      return '+' + (percent - 100) + '%';
    } else {
      return '-' + (100 - percent) + '%';
    }
  }

}
