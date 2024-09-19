import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListaDespachosComponent } from 'src/app/submenu/despacho/lista-despachos/lista-despachos.component';

import { DespachoComponent } from './despacho.component';

const routes: Routes = [
  {
    path: '',
    component: DespachoComponent,
    children:[
      {
        path: '',
        redirectTo: 'despachos',
        pathMatch: 'full'
      },
      {
        path: 'despachos',
        component: ListaDespachosComponent
      },
      {
        path: '**',
        redirectTo: 'despachos'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DespachoRoutingModule {}
