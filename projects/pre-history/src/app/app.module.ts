import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GameEngineModule } from 'game-engine';
import { AppComponent } from './app.component';
import { ColonyComponent } from './components/colony/colony.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ResearchsComponent } from './components/researchs/researchs.component';
import { ConfigComponent } from './components/config/config.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FavoritesComponent } from './components/favorites/favorites.component';

@NgModule({
  declarations: [
    AppComponent,
    ColonyComponent,
    ResearchsComponent,
    ConfigComponent,
    FavoritesComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    GameEngineModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
