import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ManagersLibComponent } from './managers-lib.component';
import { BackendApiService, ProjectsService } from './services';



@NgModule({
  declarations: [
    ManagersLibComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    ManagersLibComponent,
  ],
  providers: [
    BackendApiService,
    ProjectsService,
  ],
})
export class ManagersLibModule { }
