import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { FolderPageRoutingModule } from './folder-routing.module';

import { TomadorPedidosRoutingModule } from './tomadorPedidos-routing.module';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';


import { SwiperModule } from 'swiper/angular';

import {  TomadorPedidosComponent } from './tomadorPedidos.component';
import { ArticuloComponent } from 'src/app/submenu/tomadorPedidos/articulo/articulo.component';
import { ArticulosComponent } from 'src/app/submenu/tomadorPedidos/articulos/articulos.component';
import { VerMasComponent } from 'src/app/submenu/tomadorPedidos/ver-mas/ver-mas.component';
import { ClientesComponent } from 'src/app/submenu/tomadorPedidos/clientes/clientes.component';
import { ClienteComponent } from 'src/app/submenu/tomadorPedidos/cliente/cliente.component';
import { PedidosComponent } from 'src/app/submenu/tomadorPedidos/pedidos/pedidos.component';
import { CarritoComponent } from 'src/app/submenu/tomadorPedidos/carrito/carrito.component';
import { VendedorComponent } from 'src/app/submenu/tomadorPedidos/vendedor/vendedor.component';
import { PedidoComponent } from 'src/app/submenu/tomadorPedidos/pedido/pedido.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { PromocionesComponent } from 'src/app/submenu/tomadorPedidos/promociones/promociones.component';
import { ListaPreciosComponent } from 'src/app/submenu/tomadorPedidos/lista-precios/lista-precios.component';
import { ModalDireccionComponent } from 'src/app/submenu/tomadorPedidos/modal-direccion/modal-direccion.component';
import { AgenciasTransportesComponent } from 'src/app/submenu/tomadorPedidos/agencias-transportes/agencias-transportes.component';
import { AgenciaFormComponent } from 'src/app/submenu/tomadorPedidos/agencia-form/agencia-form.component';
import { TypeaheadComponent } from 'src/app/submenu/tomadorPedidos/typeahead/typeahead.component';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { ModalPromocionesComponent } from 'src/app/submenu/tomadorPedidos/modal-promociones/modal-promociones.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TomadorPedidosRoutingModule,
    HeaderModule,
    ScrollingModule,
    SharedModule ,
    ReactiveFormsModule,
    SwiperModule,
    ImageCropperModule,
    ComponentesModule
  ],
  declarations: [TomadorPedidosComponent,
    CarritoComponent,
    ArticulosComponent,
    ArticuloComponent,
    VerMasComponent,
    ClientesComponent,
    ClienteComponent,
    PedidosComponent,
    PedidoComponent,
    VendedorComponent,
    PromocionesComponent,
    ListaPreciosComponent,
    ModalDireccionComponent,
    AgenciasTransportesComponent,
    AgenciaFormComponent,
    TypeaheadComponent,
    ModalPromocionesComponent
  ],
  // exports:[ClientesComponent,ClienteComponent]
})
export class TomadorPedidosModule {}
