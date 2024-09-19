import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequerimientoRoutingModule } from './requerimiento-routing.module';
import { RequerimientoComponent } from './requerimiento.component';
import { IonicModule } from '@ionic/angular';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';
import { GenerarRequerimientoComponent } from 'src/app/submenu/requerimiento/generar-requerimiento/generar-requerimiento.component';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { ListaRequerimientosComponent } from 'src/app/submenu/requerimiento/lista-requerimientos/lista-requerimientos.component';
import { ListaArticulosComponent } from 'src/app/submenu/requerimiento/lista-articulos/lista-articulos.component';
import { ModalRequerimientoComponent } from 'src/app/submenu/requerimiento/modal-requerimiento/modal-requerimiento.component';
import { ListaAprobacionComponent } from 'src/app/submenu/requerimiento/lista-aprobacion/lista-aprobacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    RequerimientoComponent,
    ListaArticulosComponent,
    GenerarRequerimientoComponent,
    ListaRequerimientosComponent,
    ModalRequerimientoComponent,
    ListaAprobacionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    IonicModule,
    RequerimientoRoutingModule,
    SharedModule,
    ComponentesModule
  ]
})
export class RequerimientoModule { }
