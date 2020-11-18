import { NgModule } from '@angular/core';
import { GameMotorComponent } from './game-motor.component';
import { ResourcesPipe } from './pipes/resources/resources.pipe';
import { TrDirective } from './directives/tr/tr.directive';
import { LangsService } from './services/langs/langs.service';
import { StoreService } from './services/store/store.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [GameMotorComponent, ResourcesPipe, TrDirective],
  imports: [
    HttpClientModule,
  ],
  providers: [
    LangsService,
    StoreService,
  ],
  exports: [
    GameMotorComponent,
    ResourcesPipe,
    TrDirective,
  ],
})
export class GameMotorModule { }
