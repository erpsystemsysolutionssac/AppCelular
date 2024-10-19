import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Articulo } from 'src/app/interfaces/interfases';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  public arrCarrito: Articulo[];
  public reqSeleccionado: any;
  private rutaGlobal = this.toolsService.obtenerUrl('url') + '/planillas';
  private ruta = this.toolsService.obtenerUrl('urlApi') + '/asistencia/app/v1';

  private customHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private globalService: GlobalService,
    private toolsService: ToolsService
  ) {
    this.arrCarrito = [];
  }

  buscarTareo(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/buscar_tareo/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  marcarAsistencia(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/marcar_asistencia/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  enviarPosicion(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/send_posloc/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  eliminarPosicion(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/del_posloc/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  obtenerPosicion(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/get_posloc/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
}
