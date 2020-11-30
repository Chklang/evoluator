import { NgModule } from '@angular/core';
import { GameEngineComponent } from './game-engine.component';
import { ResourcesPipe } from './pipes/resources/resources.pipe';
import { TrDirective } from './directives/tr/tr.directive';
import { LangsService } from './services/langs/langs.service';
import { StoreService } from './services/store/store.service';
import { HttpClientModule } from '@angular/common/http';
import { TimePipe } from './pipes/time/time.pipe';
import { ProductionPipe } from './pipes/production/production.pipe';
import { PercentagePipe } from './pipes/percentage/percentage.pipe';
import { ResearchsService } from './services/researchs/researchs.service';
import { FeaturesService } from './services/features/features.service';
import { ConfigService } from './services/config/config.service';
import { FavoritesService } from './services/favorites/favorites.service';
import { PersistentService } from './services/persistent/persistent.service';

// Get base-href value
export function getBaseUrl(): string {
  try {
    return document.getElementsByTagName('base')[0].href;
  } catch (e) {
    return '/';
  }
}

@NgModule({
  declarations: [GameEngineComponent, ResourcesPipe, TrDirective, TimePipe, ProductionPipe, PercentagePipe],
  imports: [
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
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
  ],
  exports: [
    GameEngineComponent,
    ResourcesPipe,
    TrDirective,
    TimePipe,
    ProductionPipe,
    PercentagePipe,
  ],
})
export class GameEngineModule { }
