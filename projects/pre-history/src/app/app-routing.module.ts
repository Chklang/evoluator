import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColonyComponent } from './components/colony/colony.component';
import { ConfigComponent } from './components/config/config.component';
import { ResearchsComponent } from './components/researchs/researchs.component';
import { ResearchsGuard } from './components/researchs/researchs.guard';

const routes: Routes = [
  { path: '', redirectTo: '/colony', pathMatch: 'full' },
  {
    path: 'colony',
    component: ColonyComponent,
  },
  {
    path: 'colony/:selectedResource',
    component: ColonyComponent,
  },
  {
    path: 'researchs',
    component: ResearchsComponent,
    canActivate: [ResearchsGuard],
  },
  {
    path: 'config',
    component: ConfigComponent,
  },
  { path: '**', redirectTo: '/colony' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
