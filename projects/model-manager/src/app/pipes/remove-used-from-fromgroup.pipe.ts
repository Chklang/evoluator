import { Pipe, PipeTransform } from '@angular/core';
import { FormArray } from '@angular/forms';

@Pipe({
  name: 'removeUsedFromFormgroup'
})
export class RemoveUsedFromFormgroupPipe implements PipeTransform {

  transform(values: string[], controls: FormArray): string[] {
    return values.filter(e => !this.has(e, controls));
  }

  private has(value: string, controls: FormArray): boolean {
    for (let i = 0; i < controls.length; i++) {
      if (controls.at(i).get('name').value === value) {
        return true;
      }
    }
    return false;
  }

}
