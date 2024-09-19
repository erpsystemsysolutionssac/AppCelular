import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaRoutingModule } from './asistencia-routing.module';
import { AsistenciaComponent } from './asistencia.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from 'src/app/shared.module';
import { ComponentesModule } from 'src/app/submenu/components/componentes.module';
import { MarcarAsistenciaComponent } from 'src/app/submenu/planilla/asistencia/asistencia.component';
// import { FingerprintAIO, FingerprintAIOOriginal } from '@ionic-native/fingerprint-aio';
// import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';

@NgModule({
  declarations: [
    AsistenciaComponent,
    MarcarAsistenciaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    IonicModule,
    AsistenciaRoutingModule,
    SharedModule,
    ComponentesModule
  ],
  providers: [
      Uid,
      AndroidPermissions,
      FingerprintAIO
  ]
  // providers: [
  //   FingerprintAIO
  // ]
})
export class AsistenciaModule { }
