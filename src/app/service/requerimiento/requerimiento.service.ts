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
export class RequerimientoService {

  public arrCarrito: Articulo[];
  public reqSeleccionado: any;
  private rutaApi = this.toolsService.obtenerUrl('urlApi') + '/requerimientos/app/v1';

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

  agregarCarrito(articulo: Articulo) {

    this.arrCarrito.push(articulo)

  }

  guardarRequerimiento(dataRequerimiento: any) {
    return this.http.post<any>(this.rutaApi + '/guardar/' + this.globalService.calcularNumeroRandomUrl(), dataRequerimiento, this.customHeaders).toPromise()
  }

  listaRequerimientos(inicio: number, limite: number, texto: string, fechaInicio: string, fechaFinal: string, busqueda: string) {
   
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

    return this.http.post<any[]>(this.rutaApi + '/lista/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarRequerimiento(motivo_documento: string, numero_documento: string, codigo_punto_venta: string) {
   
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      motivo_documento,
      numero_documento,
      codigo_punto_venta,
    };

    return this.http.post<any[]>(this.rutaApi + '/consultar/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  actualizarArchivo(numero_correlativo: string, motivo_documento: string, ruta_pdf: string) {
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      numero_correlativo,
      motivo_documento,
      codigo_punto_venta: this.loginService.datosUsu.punto_venta,
      ruta_pdf
    }

    return this.http.post<any>(this.rutaApi + '/actualizarArchivo/' + this.globalService.calcularNumeroRandomUrl(), body, this.customHeaders).toPromise()
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
      centro_costos: this.loginService.datosUsu.centro_costos,
      unidad_negocios: this.loginService.datosUsu.unidad_negocio,
      estado,
      prioridad
    };

    return this.http.post<any[]>(this.rutaApi + '/lista_documentos_aprobacion01/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  actualizarAprobacion(aprobacion: string, responsable: string, comentario: string, fila: any[]) {
    
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      aprobacion,
      responsable,
      fecha: this.loginService.datosUsu.fecha_trabajo_sistema,
      comentario,
      codigo_usuario: this.loginService.codigo_usuario,
      fila: JSON.stringify(fila),
    };

    return this.http.post<any[]>(this.rutaApi + '/aprobaciones01/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }
}
