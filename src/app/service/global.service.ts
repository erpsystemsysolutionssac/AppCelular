import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Vendedor } from '../interfaces/interfases';
import { LoginService } from './login.service';
import { ToolsService } from './tools.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private rutaLogin = this.toolsService.obtenerUrl('url') + '/global'

  constructor(
    private http: HttpClient, 
    private loginS: LoginService,
    private toolsService: ToolsService
  ) { }

  editarVendedor(datos: any) {
    datos.codigo_empresa = this.loginS.codigo_empresa
    datos.ccod_vendedor = this.loginS.objVendedor.ccod_vendedor

    return this.http.post(this.rutaLogin + '/editar_vendedor', { ...datos }).toPromise()
  }

  guardarTokenDispositivo(dataBody: any) {
    console.log('Saving device token with data:', dataBody);
    return this.http.post(this.rutaLogin + '/guardar_tokens_dispositivo', dataBody ).toPromise()
  }

  calcularNumeroRandomUrl() {
    var random = Math.floor((Math.random() * (1000 - 1 + 1)) + 1);
    var milliseconds = new Date().getMilliseconds()
    var codigo_usuario = this.loginS.codigo_usuario
    var numero_adicional = codigo_usuario + '-' + random + '-' + milliseconds
    return numero_adicional;
  }

  getShortDate(date) {
    var d = new Date(date);
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = d.getFullYear() + '-' +
      (('' + month).length < 2 ? '0' : '') + month + '-' +
      (('' + day).length < 2 ? '0' : '') + day;

    return output;
  }

  getDateOfNewDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = d.getFullYear() + '-' +
      (('' + month).length < 2 ? '0' : '') + month + '-' +
      (('' + day).length < 2 ? '0' : '') + day;

    return output;
  }

  getDateOfNewDateFormat() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    var output = (('' + day).length < 2 ? '0' : '') + day + '/' +
      (('' + month).length < 2 ? '0' : '') + month + '/' +
      d.getFullYear();

    return output;
  }

  getYear(date) {
    var d = new Date(date);
    var output = d.getFullYear()

    return output;
  }

  restarFechas(fecha_1, fecha_2) {

    var d_1: any = new Date(fecha_1);
    var d_2: any = new Date(fecha_2);
    var dif = d_1 - d_2;
 
    var output = Math.floor(dif / (1000 * 60 * 60 * 24));
    return output;
  }

  async getPublicIP() {
    var public_ip = "1.1.1.1";
    let ipFinal = '1.1.1.1'

    let arr: any

    await fetch("https://www.cloudflare.com/cdn-cgi/trace", { mode: "cors" })
      .then(response => response.text())
      .then(val => {
        arr = val.split('\n')
        arr = arr[2].split('=')[1]
        ipFinal = arr
      })
    return ipFinal
  }

 
}
