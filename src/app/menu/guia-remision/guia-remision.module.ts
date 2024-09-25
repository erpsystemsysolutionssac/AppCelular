import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GuiaRemisionComponent } from './guia-remision.component';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { ArticuloComponent } from 'src/app/submenu/guiaRemision/articulo/articulo.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from 'src/app/shared.module';
import { GuiaRemisionRoutingModule } from './guia-remision-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { VerMasComponent } from 'src/app/submenu/guiaRemision/ver-mas/ver-mas.component';
import { PromocionesComponent } from 'src/app/submenu/guiaRemision/promociones/promociones.component';
import { GuiasComponent } from 'src/app/submenu/guiaRemision/guias/guias.component';
import { GuiaComponent } from 'src/app/submenu/guiaRemision/guia/guia.component';
import { MantenimientosModule } from 'src/app/submenu/mantenimientos/mantenimientos.modulo';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { CarritoV2Component } from 'src/app/submenu/guiaRemision/carrito-v2/carrito-v2.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GuiaRemisionRoutingModule,
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
    GuiaRemisionComponent,
    ArticuloComponent,
    VerMasComponent,
    GuiasComponent,
    GuiaComponent,
    PromocionesComponent,
    CarritoV2Component
  ],
  
})
export class GuiaRemisionModule { }
