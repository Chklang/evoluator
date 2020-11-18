import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LangsService, StoreService } from 'game-motor';
import { buildings, resources, gameFromScratch } from './database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public constructor(
    private storeService: StoreService,
    public readonly langsService: LangsService,
  ) {}

  public backgroundAction(action: Observable<any>): void {
    action.subscribe({
      complete: () => {
      },
      error: (e) => {
        console.error(e);
      },
    });
  }

  public ngOnInit(): void {
    this.storeService.init({
      allBuildings: buildings,
      allResources: resources,
      gameFromScratch,
    });
    this.storeService.start();
  }
}
