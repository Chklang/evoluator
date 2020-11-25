import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColonyComponent } from './components/colony/colony.component';
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
  { path: '**', redirectTo: '/colony' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
