import { ElementRef } from '@angular/core';
import { LangsService } from '../../services';
import { TrDirective } from './tr.directive';

describe('TrDirective', () => {
  let langsService: LangsService;
  let el: ElementRef;

  beforeEach(() => {
    el = {
      nativeElement: {
        innerText: "",
      },
    };
  });
  it('should create an instance', () => {
    const directive = new TrDirective(langsService, el);
    expect(directive).toBeTruthy();
  });
});
