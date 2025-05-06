import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcadorRoutingModule } from './marcador-routing.module';
import { MarcadorComponent } from './marcador.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { MarcarMarcadorComponent } from 'src/app/submenu/planilla/marcador/marcador.component';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';

@NgModule({
  declarations: [
    MarcadorComponent,
    MarcarMarcadorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    IonicModule,
    MarcadorRoutingModule,
    // SharedModule,
    ComponentesModule
  ],
  providers: [
      AndroidPermissions,
      FingerprintAIO
  ]
  // providers: [
  //   FingerprintAIO
  // ]
})
export class MarcadorModule { }
