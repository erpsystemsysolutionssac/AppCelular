import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LoginModule } from './login/login.module';
import { HttpClientModule } from '@angular/common/http';
import { LoginGuard } from './guard/login.guard';
import { LoginChildGuard } from './guard/login-child.guard';
import { HeaderModule } from './layout/header/header.module';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// const config: SocketIoConfig = {
//   // url: 'https://erp-solutionsperu.com', // socket server url;
// 	url: 'http://192.168.1.111:5000', // socket server url;
// 	options: {
//     query: {"codigo_empresa": '0000000021'},
// 		transports: ['websocket']
// 	}
// }

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    CommonModule,
    LoginModule,
    HttpClientModule,
    HeaderModule,
    // SocketIoModule.forRoot(config),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, LoginGuard, LoginChildGuard, DecimalPipe],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule { }
