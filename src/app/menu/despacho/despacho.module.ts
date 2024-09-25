import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';

import { SwiperModule } from 'swiper/angular';

import { ImageCropperModule } from 'ngx-image-cropper';

import { DespachoRoutingModule } from './despacho-routing.module';
import { DespachoComponent } from './despacho.component';
import { ListaDespachosComponent } from 'src/app/submenu/despacho/lista-despachos/lista-despachos.component';
import { ModalPedidoComponent } from 'src/app/submenu/despacho/modal-pedido/modal-pedido.component';

@NgModule({
    entryComponents: [
        ModalPedidoComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DespachoRoutingModule,
        HeaderModule,
        ScrollingModule,
        // SharedModule,
        ReactiveFormsModule,
        SwiperModule,
        ImageCropperModule
    ],
    declarations: [
        DespachoComponent,
        ListaDespachosComponent,
        ModalPedidoComponent
    ],
    // exports:[ClientesComponent,ClienteComponent]
})
export class DespachoModule { }
