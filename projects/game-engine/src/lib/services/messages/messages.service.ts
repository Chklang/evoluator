import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private messagesCache: IMessage[] = [];
  public readonly messages$: Subject<IMessage[]> = new BehaviorSubject(this.messagesCache);

  constructor() { }

  public static create(newMessage: INewMessage): INewMessage {
    return newMessage;
  }

  public addMessage(newMessage: INewMessage): void {
    const message: IMessage = {
      code: newMessage.code,
      persistent: newMessage.persistent === true,
      remove: () => {
        this.messagesCache = this.messagesCache.filter((e) => e !== message);
        this.messages$.next(this.messagesCache);
      },
      type: newMessage.type,
      values: newMessage.values || [],
    };
    this.messagesCache.push(message);
    this.messages$.next(this.messagesCache);
    if (!message.persistent) {
      setTimeout(message.remove, 5_000);
    }
  }

}

export interface INewMessage {
  persistent?: boolean;
  code: string;
  values?: (string | number)[];
  type: 'ERROR' | 'INFO';
}

export interface IMessage {
  persistent: boolean;
  code: string;
  values: (string | number)[];
  type: 'ERROR' | 'INFO';
  remove: () => void;
}
