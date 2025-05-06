import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Articulo } from 'src/app/interfaces/interfases';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class MarcadorService {

  public arrCarrito: Articulo[];
  public reqSeleccionado: any;
  private rutaGlobal = this.toolsService.obtenerUrl('url') + '/planillas';

  private customHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private globalService: GlobalService,
    private toolsService: ToolsService
  ) {
    this.arrCarrito = [];
  }

  marcarAsistencia(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/marcador_asistencia/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  obtenerDatos(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/obtener_datos/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
}
