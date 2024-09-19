import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RequerimientoComponent } from './requerimiento.component';
import { ListaArticulosComponent } from 'src/app/submenu/requerimiento/lista-articulos/lista-articulos.component';
import { GenerarRequerimientoComponent } from 'src/app/submenu/requerimiento/generar-requerimiento/generar-requerimiento.component';
import { ListaRequerimientosComponent } from 'src/app/submenu/requerimiento/lista-requerimientos/lista-requerimientos.component';
import { ModalRequerimientoComponent } from 'src/app/submenu/requerimiento/modal-requerimiento/modal-requerimiento.component';
import { ListaAprobacionComponent } from 'src/app/submenu/requerimiento/lista-aprobacion/lista-aprobacion.component';

const routes: Routes = [{
  path: '',
  component: RequerimientoComponent,
  children: [
    {
      path: '',
      redirectTo: 'articulos',
      pathMatch: 'full'
    },
    {
      path:'articulos',
      component: ListaArticulosComponent
    },
    {
      path:'generarRequerimiento',
      component: GenerarRequerimientoComponent
    },
    {
      path:'listaRequerimientos',
      component: ListaRequerimientosComponent
    }, 
    {
      path:'verRequerimiento/:cod',
      component: ModalRequerimientoComponent
    },
    {
      path: 'aprobacion',
      component: ListaAprobacionComponent,
    },
    {
      path: '**',
      redirectTo: 'articulos'
    }
  ]
}]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class RequerimientoRoutingModule { }
