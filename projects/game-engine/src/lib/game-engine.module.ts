import { NgModule } from '@angular/core';
import { GameEngineComponent } from './game-engine.component';
import { ResourcesPipe } from './pipes/resources/resources.pipe';
import { TrDirective } from './directives/tr/tr.directive';
import { LangsService } from './services/langs/langs.service';
import { StoreService } from './services/store/store.service';
import { HttpClientModule } from '@angular/common/http';
import { TimePipe } from './pipes/time/time.pipe';

// Get base-href value
export function getBaseUrl(): string {
  try {
    return document.getElementsByTagName('base')[0].href;
  } catch (e) {
    return '/';
  }
}

@NgModule({
  declarations: [GameEngineComponent, ResourcesPipe, TrDirective, TimePipe],
  imports: [
    HttpClientModule,
  ],
  providers: [
    LangsService,
    StoreService,
    { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
  ],
  exports: [
    GameEngineComponent,
    ResourcesPipe,
    TrDirective,
    TimePipe,
  ],
})
export class GameEngineModule { }
