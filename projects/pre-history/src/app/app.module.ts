import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GameMotorModule } from 'game-motor';
import { AppComponent } from './app.component';
import { ColonyComponent } from './components/colony/colony.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    ColonyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GameMotorModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
