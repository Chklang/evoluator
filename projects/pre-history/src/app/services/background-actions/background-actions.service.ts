import { Injectable } from '@angular/core';
import { MessagesService } from 'game-engine';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundActionsService {

  constructor(
    private messagesService: MessagesService,
  ) { }

  public execute(action: Observable<any>): void {
    action.subscribe({
      complete: () => {
      },
      error: (e) => {
        this.messagesService.addMessage(e);
        console.error(e);
      },
    });
  }
}
