import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SchemaComponent, SchemaDirective } from './components/schema/schema.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EditResourceComponent } from './components/popups/edit-resource/edit-resource.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SaveComponent } from './components/popups/save/save.component';
import { SerializeGameContextPipe } from './components/popups/save/serialize-game-context.pipe';
import { EditResearchComponent } from './components/popups/edit-research/edit-research.component';
import { EditFeatureComponent } from './components/popups/edit-feature/edit-feature.component';
import { EditBuildingComponent } from './components/popups/edit-building/edit-building.component';
import { EditAchievementComponent } from './components/popups/edit-achievement/edit-achievement.component';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { RemoveUsedFromFormgroupPipe } from './pipes/remove-used-from-fromgroup.pipe';
import { SelectValueFormComponent } from './components/select-value-form/select-value-form.component';
import { EditBlockersComponent } from './components/edit-blockers/edit-blockers.component';
import { ResourcesNamePipe } from './pipes/resources-name.pipe';
import { BuildingsNamePipe } from './pipes/buildings-name.pipe';
import { FeaturesNamePipe } from './pipes/features-name.pipe';

// Get base-href value
export function getBaseUrl(): string {
  try {
    return document.getElementsByTagName('base')[0].href;
  } catch (e) {
    return '/';
  }
}

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
    RemoveUsedFromFormgroupPipe,
    SelectValueFormComponent,
    EditBlockersComponent,
    ResourcesNamePipe,
    BuildingsNamePipe,
    FeaturesNamePipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    HighlightModule,
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
        }
      }
    },
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
