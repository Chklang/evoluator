import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LangsService, StoreService } from 'game-engine';
import { buildings, resources, gameFromScratch } from './database';
import { BackgroundActionsService } from './services/background-actions/background-actions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public constructor(
    private storeService: StoreService,
    public readonly langsService: LangsService,
    public readonly backgroundAction: BackgroundActionsService,
  ) {}

  public ngOnInit(): void {
    this.storeService.init({
      allBuildings: buildings,
      allResources: resources,
      gameFromScratch,
    });
    this.storeService.start();
  }
}
