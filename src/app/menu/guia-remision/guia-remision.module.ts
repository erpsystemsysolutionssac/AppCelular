import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GuiaRemisionComponent } from './guia-remision.component';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { ArticulosComponent } from 'src/app/submenu/guiaRemision/articulos/articulos.component';
import { ArticuloComponent } from 'src/app/submenu/guiaRemision/articulo/articulo.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from 'src/app/shared.module';
import { GuiaRemisionRoutingModule } from './guia-remision-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CarritoComponent } from 'src/app/submenu/guiaRemision/carrito/carrito.component';
import { VerMasComponent } from 'src/app/submenu/guiaRemision/ver-mas/ver-mas.component';
import { ClientesComponent } from 'src/app/submenu/guiaRemision/clientes/clientes.component';
import { ClienteComponent } from 'src/app/submenu/guiaRemision/cliente/cliente.component';
import { VendedorComponent } from 'src/app/submenu/guiaRemision/vendedor/vendedor.component';
import { PromocionesComponent } from 'src/app/submenu/guiaRemision/promociones/promociones.component';
import { ListaPreciosComponent } from 'src/app/submenu/guiaRemision/lista-precios/lista-precios.component';
import { ModalDireccionComponent } from 'src/app/submenu/guiaRemision/modal-direccion/modal-direccion.component';
import { AgenciasTransportesComponent } from 'src/app/submenu/guiaRemision/agencias-transportes/agencias-transportes.component';
import { AgenciaFormComponent } from 'src/app/submenu/guiaRemision/agencia-form/agencia-form.component';
import { TypeaheadComponent } from 'src/app/submenu/guiaRemision/typeahead/typeahead.component';
import { ModalPromocionesComponent } from 'src/app/submenu/guiaRemision/modal-promociones/modal-promociones.component';
import { GuiasComponent } from 'src/app/submenu/guiaRemision/guias/guias.component';
import { GuiaComponent } from 'src/app/submenu/guiaRemision/guia/guia.component';



@NgModule({
  declarations: [
    GuiaRemisionComponent,
    CarritoComponent,
    ArticulosComponent,
    ArticuloComponent,
    VerMasComponent,
    ClientesComponent,
    ClienteComponent,
    GuiasComponent,
    GuiaComponent,
    VendedorComponent,
    PromocionesComponent,
    ListaPreciosComponent,
    ModalDireccionComponent,
    AgenciasTransportesComponent,
    AgenciaFormComponent,
    TypeaheadComponent,
    ModalPromocionesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    IonicModule,
    GuiaRemisionRoutingModule,
    ComponentesModule,
    ImageCropperModule,
    SwiperModule,
    SharedModule,
  ]
})
export class GuiaRemisionModule { }
