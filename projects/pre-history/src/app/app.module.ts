import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GameEngineModule } from 'game-engine';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AchievementsComponent } from './components/achievements/achievements.component';
import { BlockerStatusComponent } from './components/blocker-status/blocker-status.component';
import { ColonyComponent } from './components/colony/colony.component';
import { ConfigComponent } from './components/config/config.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { UnlockResearchComponent } from './components/popups/unlocks/research/unlock-research.component';
import { ResearchsComponent } from './components/researchs/researchs.component';

@NgModule({
  declarations: [
    AppComponent,
    ColonyComponent,
    ResearchsComponent,
    ConfigComponent,
    FavoritesComponent,
    AchievementsComponent,
    BlockerStatusComponent,
    UnlockResearchComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ModalModule.forRoot(),
    GameEngineModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
