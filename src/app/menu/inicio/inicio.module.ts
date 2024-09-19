import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InicioRoutingModule } from './inicio-routing.module';
import { InicioComponent } from './inicio.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/layout/header/header.component';
import { HeaderModule } from 'src/app/layout/header/header.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [InicioComponent],
  imports: [
    CommonModule,
    InicioRoutingModule,
    IonicModule,
    HeaderModule,
    RouterModule
  ]
})
export class InicioModule { }
