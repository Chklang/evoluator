import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ManagersLibModule } from 'managers-lib';
import { ProjectComponent } from './components/project/project.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ProjectComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ManagersLibModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
