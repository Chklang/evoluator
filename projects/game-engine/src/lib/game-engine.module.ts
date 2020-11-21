import { NgModule } from '@angular/core';
import { GameEngineComponent } from './game-engine.component';
import { ResourcesPipe } from './pipes/resources/resources.pipe';
import { TrDirective } from './directives/tr/tr.directive';
import { LangsService } from './services/langs/langs.service';
import { StoreService } from './services/store/store.service';
import { HttpClientModule } from '@angular/common/http';

// Get base-href value
export function getBaseUrl() {
  try {
    return document.getElementsByTagName('base')[0].href;
  } catch (e) {
    return '/';
  }
}

@NgModule({
  declarations: [GameEngineComponent, ResourcesPipe, TrDirective],
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
  ],
})
export class GameEngineModule { }
