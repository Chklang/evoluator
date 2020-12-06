import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MessagesComponent } from './components/messages/messages.component';
import { TrDirective } from './directives/tr/tr.directive';
import { MaintenancePipe } from './pipes/maintenance/maintenance.pipe';
import { PercentagePipe } from './pipes/percentage/percentage.pipe';
import { ProductionPipe } from './pipes/production/production.pipe';
import { ResourcesPipe } from './pipes/resources/resources.pipe';
import { TimePipe } from './pipes/time/time.pipe';
import { AchievementsService } from './services/achievements/achievements.service';
import { ConfigService } from './services/config/config.service';
import { FavoritesService } from './services/favorites/favorites.service';
import { FeaturesService } from './services/features/features.service';
import { LangsService } from './services/langs/langs.service';
import { MessagesService } from './services/messages/messages.service';
import { PersistentService } from './services/persistent/persistent.service';
import { ResearchsService } from './services/researchs/researchs.service';
import { StoreService } from './services/store/store.service';
import { CommonModule } from '@angular/common';

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
    MessagesComponent,
    ResourcesPipe,
    TrDirective,
    TimePipe,
    ProductionPipe,
    PercentagePipe,
    MaintenancePipe,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    LangsService,
    StoreService,
    ResearchsService,
    FeaturesService,
    ConfigService,
    FavoritesService,
    PersistentService,
    AchievementsService,
    MessagesService,
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
  ],
  exports: [
    MessagesComponent,
    ResourcesPipe,
    TrDirective,
    TimePipe,
    ProductionPipe,
    PercentagePipe,
    MaintenancePipe,
  ],
})
export class GameEngineModule { }
