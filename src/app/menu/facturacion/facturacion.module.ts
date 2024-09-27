import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacturacionRoutingModule } from './facturacion-routing.module';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';
import { SwiperModule } from 'swiper/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { MantenimientosModule } from 'src/app/submenu/mantenimientos/mantenimientos.modulo';
import { FacturacionComponent } from './facturacion.component';
import { VerMasComponent } from 'src/app/submenu/facturacion/ver-mas/ver-mas.component';
import { ListaFacturaComponent } from 'src/app/submenu/facturacion/lista-factura/lista-factura.component';
import { FacturaComponent } from 'src/app/submenu/facturacion/factura/factura.component';
import { CarritoV2Component } from 'src/app/submenu/facturacion/carrito-v2/carrito-v2.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacturacionRoutingModule,
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
    FacturacionComponent,
    VerMasComponent,
    ListaFacturaComponent,
    FacturaComponent,
    // PromocionesComponent,
    CarritoV2Component
  ],
})
export class FacturacionModule { }
