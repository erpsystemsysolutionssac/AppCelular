import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClienteComponent } from './cliente/cliente.component';
import { SwiperModule } from 'swiper/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from 'src/app/shared.module';
import { AgenciaComponent } from './agencia/agencia.component';
import { VendedorComponent } from './vendedor/vendedor.component';

@NgModule({
  declarations: [
    ClienteComponent,
    AgenciaComponent,
    VendedorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SwiperModule,
    ImageCropperModule,
    SharedModule
  ],
  exports: [
    ClienteComponent,
    AgenciaComponent,
    VendedorComponent
  ]
})
export class MantenimientosModule { }
