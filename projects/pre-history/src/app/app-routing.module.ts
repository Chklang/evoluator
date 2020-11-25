import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColonyComponent } from './components/colony/colony.component';
import { ResearchsComponent } from './components/researchs/researchs.component';

const routes: Routes = [
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
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
