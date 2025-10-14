import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';
import { SwiperModule } from 'swiper/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { MantenimientosModule } from 'src/app/submenu/mantenimientos/mantenimientos.modulo';
import { AtencionTicketsComponent } from 'src/app/submenu/tickets/atencionTickets/atencion-tickets.component';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketsComponent } from './tickets.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TicketsRoutingModule,
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
    TicketsComponent,
    AtencionTicketsComponent
  ],
})
export class TicketsModule { }
