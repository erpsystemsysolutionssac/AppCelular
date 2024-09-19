import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AsistenciaComponent } from './asistencia.component';
import { MarcarAsistenciaComponent } from 'src/app/submenu/planilla/asistencia/asistencia.component';

const routes: Routes = [{
  path: '',
  component: AsistenciaComponent,
  children: [
    {
      path: '',
      redirectTo: 'asistencia',
      pathMatch: 'full'
    },
    {
      path:'asistencia',
      component: MarcarAsistenciaComponent
    },
    {
      path: '**',
      redirectTo: 'asistencia'
    }
  ]
}]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class AsistenciaRoutingModule { }
