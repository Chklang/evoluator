import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: number, format: string): string {
    const hours = Math.floor(value / 3_600_000);
    value -= hours * 3_600_000;
    const minutes = Math.floor(value / 60_000);
    value -= minutes * 60_000;
    const secs = Math.floor(value / 1000);
    let result: string;
    if (hours) {
      result =  this.setLength(hours) + ':' + this.setLength(minutes) + ':' + this.setLength(secs);
    } else if (minutes) {
      result =  this.setLength(minutes) + ':' + this.setLength(secs);
    } else {
      result = '00:' + this.setLength(secs);
    }
    return result;
  }

  private setLength(value: number): string {
    let result = String(value);
    while (result.length < 2) {
      result = '0' + result;
    }
    return result;
  }

}
