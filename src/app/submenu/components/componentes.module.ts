import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { IonicModule } from '@ionic/angular';
import { TomadorPedidosRoutingModule } from 'src/app/menu/tomadorPedidos/tomadorPedidos-routing.module';
import { RequerimientoRoutingModule } from 'src/app/menu/requerimiento/requerimiento-routing.module';
import { GuiaRemisionRoutingModule } from 'src/app/menu/guia-remision/guia-remision-routing.module';
import { DocumentosPendientesComponent } from './documentos-pendientes/documentos-pendientes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';



@NgModule({
  declarations: [
    MenuComponent,
    DocumentosPendientesComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    TomadorPedidosRoutingModule,
    GuiaRemisionRoutingModule,
    RequerimientoRoutingModule
  ],
  exports: [
    MenuComponent,
    DocumentosPendientesComponent
  ]
})
export class ComponentesModule { }
