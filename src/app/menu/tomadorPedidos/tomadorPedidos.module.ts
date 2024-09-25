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
import { VerMasComponent } from 'src/app/submenu/tomadorPedidos/ver-mas/ver-mas.component';
import { PedidosComponent } from 'src/app/submenu/tomadorPedidos/pedidos/pedidos.component';
import { PedidoComponent } from 'src/app/submenu/tomadorPedidos/pedido/pedido.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { PromocionesComponent } from 'src/app/submenu/tomadorPedidos/promociones/promociones.component';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { CarritoV2Component } from 'src/app/submenu/tomadorPedidos/carrito-v2/carrito-v2.component';
import { MantenimientosModule } from 'src/app/submenu/mantenimientos/mantenimientos.modulo';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TomadorPedidosRoutingModule,
    HeaderModule,
    ScrollingModule,
    SharedModule,
    ReactiveFormsModule,
    SwiperModule,
    ImageCropperModule,
    ComponentesModule,
    MantenimientosModule
  ],
  declarations: [
    TomadorPedidosComponent,
    ArticuloComponent,
    VerMasComponent,
    PedidosComponent,
    PedidoComponent,
    PromocionesComponent,
    CarritoV2Component
  ],
  // exports:[ClientesComponent,ClienteComponent]
})
export class TomadorPedidosModule {}
