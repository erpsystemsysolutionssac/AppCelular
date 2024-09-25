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
import { ListaArticulosComponent } from './lista-articulos/lista-articulos.component';
import { ModalPromocionesComponent } from './modal-promociones/modal-promociones.component';
import { ModalImagenesArticuloComponent } from './modal-imagenes-articulo/modal-imagenes-articulo.component';
import { SwiperModule } from 'swiper/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';
import { SharedModule } from 'src/app/shared.module';
import { ModalDireccionComponent } from './modal-direccion/modal-direccion.component';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { ModalImagenesClienteComponent } from './modal-imagenes-cliente/modal-imagenes-cliente.component';
import { ListaAgenciasTransporteComponent } from './lista-agencias-transporte/lista-agencias-transporte.component';
import { ListaPreciosComponent } from './lista-precios/lista-precios.component';



@NgModule({
  declarations: [
    MenuComponent,
    DocumentosPendientesComponent,
    ListaArticulosComponent,
    ModalPromocionesComponent,
    ModalImagenesArticuloComponent,
    ListaClientesComponent,
    TypeaheadComponent,
    ModalDireccionComponent,
    ModalImagenesClienteComponent,
    ListaAgenciasTransporteComponent,
    ListaPreciosComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    SwiperModule,
    ImageCropperModule,
    SharedModule,
    TomadorPedidosRoutingModule,
    GuiaRemisionRoutingModule,
    RequerimientoRoutingModule
  ],
  exports: [
    MenuComponent,
    DocumentosPendientesComponent,
    ListaArticulosComponent,
    ModalPromocionesComponent,
    ModalImagenesArticuloComponent,
    ListaClientesComponent,
    TypeaheadComponent,
    ModalDireccionComponent,
    ModalImagenesClienteComponent,
    ListaAgenciasTransporteComponent,
    ListaPreciosComponent
  ]
})
export class ComponentesModule { }
