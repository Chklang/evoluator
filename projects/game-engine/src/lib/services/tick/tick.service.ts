import { Injectable } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class TickService {
  public readonly tick$: Observable<number>;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.tick$ = this.configService.config$.pipe(
      switchMap((config) => {
        return interval(1000 / (config.framerate || 1));
      }),
      map(() => Date.now()),
      shareReplay(1),
    );
  }
}
