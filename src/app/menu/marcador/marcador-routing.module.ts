import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MarcadorComponent } from './marcador.component';
import { MarcarMarcadorComponent } from 'src/app/submenu/planilla/marcador/marcador.component';

const routes: Routes = [{
  path: '',
  component: MarcadorComponent,
  children: [
    {
      path: '',
      redirectTo: 'marcador',
      pathMatch: 'full'
    },
    {
      path:'marcador',
      component: MarcarMarcadorComponent
    },
    {
      path: '**',
      redirectTo: 'marcador'
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
export class MarcadorRoutingModule { }
