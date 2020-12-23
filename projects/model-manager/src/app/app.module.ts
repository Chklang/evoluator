import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SchemaComponent, SchemaDirective } from './components/schema/schema.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EditResourceComponent } from './components/popups/edit-resource/edit-resource.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SaveComponent } from './components/popups/save/save.component';
import { SerializeGameContextPipe } from './components/popups/save/serialize-game-context.pipe';
import { EditResearchComponent } from './components/popups/edit-research/edit-research.component';
import { EditFeatureComponent } from './components/popups/edit-feature/edit-feature.component';
import { EditBuildingComponent } from './components/popups/edit-building/edit-building.component';
import { EditAchievementComponent } from './components/popups/edit-achievement/edit-achievement.component';

@NgModule({
  declarations: [
    AppComponent,
    SchemaComponent,
    SchemaDirective,
    EditResourceComponent,
    SaveComponent,
    SerializeGameContextPipe,
    EditResearchComponent,
    EditFeatureComponent,
    EditBuildingComponent,
    EditAchievementComponent,
    // EditResourceDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
