import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundActionsService {

  constructor() { }

  public execute(action: Observable<any>): void {
    action.subscribe({
      complete: () => {
      },
      error: (e) => {
        console.error(e);
      },
    });
  }
}
