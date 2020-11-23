import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColonyComponent } from './components/colony/colony.component';

const routes: Routes = [
  {
    path: 'colony',
    component: ColonyComponent,
  },
  {
    path: 'colony/:selectedResource',
    component: ColonyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
