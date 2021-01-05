import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { BackendApiService } from '../backend-api/backend-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(
    private backendApiService: BackendApiService,
  ) { }

  public getProjects(): Observable<string[]> {
    return this.backendApiService.list('/').pipe(
      switchMap((entries): Observable<{isGame: boolean, name: string}[]> => {
        const obs = entries.map(entry => this.backendApiService.read('/' + entry + '/config.json').pipe(
          map(() => true),
          catchError(() => of(false)),
          map(isGame => {
            return {
              isGame,
              name: entry,
            };
          })
        ));
        if (obs.length === 0) {
          return of([]);
        } else {
          return forkJoin(obs);
        }
      }),
      map(entries => {
        return entries.filter(e => e.isGame).map(e => e.name);
      }),
      shareReplay(1),
    );
  }
}
