import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GameEngineModule } from 'game-engine';
import { AppComponent } from './app.component';
import { ColonyComponent } from './components/colony/colony.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [
    AppComponent,
    ColonyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GameEngineModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
