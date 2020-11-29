import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  IConfig
} from '../../model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public config$: Subject<IConfig> = new BehaviorSubject({
    framerate: 60,
  });

  constructor() { }
}
