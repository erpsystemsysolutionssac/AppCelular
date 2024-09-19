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
  private rutaGlobal = this.toolsService.obtenerUrl('url') + '/global';
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

  buscarAsistencia(dataAsistencia: any) {
    return this.http.post<any>(this.rutaGlobal + '/datos_usuario/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }
  agregarCarrito(articulo: Articulo) {

    this.arrCarrito.push(articulo)

  }

  guardarAsistencia(dataAsistencia: any) {
    return this.http.post<any>(this.ruta + '/guardar/' + this.globalService.calcularNumeroRandomUrl(), dataAsistencia, this.customHeaders).toPromise()
  }

  listaAsistencia(inicio: number, limite: number, texto: string, fechaInicio: string, fechaFinal: string, busqueda: string) {
   
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      inicio,
      limite,
      texto,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      busqueda,
      usuario_areas: 'N',
      codigo_punto_venta: this.loginService.datosUsu.punto_venta
    };

    return this.http.post<any[]>(this.ruta + '/lista/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarAsistencia(motivo_documento: string, numero_documento: string, codigo_punto_venta: string) {
   
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      motivo_documento,
      numero_documento,
      codigo_punto_venta,
    };

    return this.http.post<any[]>(this.ruta + '/consultar/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  actualizarArchivo(numero_correlativo: string, motivo_documento: string, ruta_pdf: string) {
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      numero_correlativo,
      motivo_documento,
      codigo_punto_venta: this.loginService.datosUsu.punto_venta,
      ruta_pdf
    }

    return this.http.post<any>(this.ruta + '/actualizarArchivo/' + this.globalService.calcularNumeroRandomUrl(), body, this.customHeaders).toPromise()
  }

  listaReqAprobacion01(inicio: number, limite: number, texto: string, fechaInicio: string, fechaFinal: string, estado: string, prioridad: string, busqueda: string) {
  
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      inicio,
      limite,
      texto,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      busqueda,
      usuario_areas: 'N',
      codigo_punto_venta: this.loginService.datosUsu.punto_venta,
      estado,
      prioridad
    };

    return this.http.post<any[]>(this.ruta + '/lista_documentos_aprobacion01/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  actualizarAprobacion(aprobacion: string, responsable: string, comentario: string, fila: any[]) {
    
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      aprobacion,
      responsable,
      fecha: this.loginService.datosUsu.fecha_trabajo_sistema,
      comentario,
      fila: JSON.stringify(fila),
    };

    return this.http.post<any[]>(this.ruta + '/aprobaciones01/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }
}
