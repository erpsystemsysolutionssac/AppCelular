import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoginService } from '../login.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {

  private ruta = "wss://erp-solutionsperu.com";


  private websocket;

  private customHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {}

  wsConnect(){
    this.websocket = new WebSocket(this.ruta);

    this.websocket.onopen = (evt) => {
      console.log(evt);
    }

    this.websocket.onclose = (evt) => {
      console.log('Cerrado');
      setTimeout(()=> {
        this.wsConnect();
      }, 2000)
    }

    this.websocket.onmessage = (evt) => {
      console.log(evt.data);
    }

    this.websocket.onerror =  (evt) => {
      console.log("Error: "+ evt);
    }
  }

  sendMessage(mensaje){
    this.websocket.send(JSON.stringify([{codigo_empresa: this.loginService.codigo_empresa, mensaje: mensaje}]));
  }



}
