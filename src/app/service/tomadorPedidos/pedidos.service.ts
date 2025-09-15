import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PedidoCabecera } from 'src/app/interfaces/pedidoCabecera';
import { PedidoDetalle } from 'src/app/interfaces/pedidoDetalle';

import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private urlArchivos = this.toolsService.obtenerUrl('urlArchivos') + '/pedidos'
  private rutaApi = this.toolsService.obtenerUrl('urlApi') + '/pedido/app/v1';

  public pedidoCabecera: PedidoCabecera = {}
  public _refresh$ = new Subject<any>();

  public rutaClientes: PedidoCabecera[] = []

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private toolsService: ToolsService,
    private globalService: GlobalService
  ) { }

  refresh() {
    this._refresh$.next(true);
  }

  obtenerPedidos(inicio: number, limite: number, filtro: string[], campo: string) {
    return this.http.post<PedidoCabecera[]>(this.rutaApi + '/obtener_pedidos', { codigo_empresa: this.loginService.codigo_empresa, inicio, limite, vendedor: this.loginService.objVendedor.ccod_vendedor, filtro, campo, codigo_usuario: this.loginService.codigo_usuario }).toPromise()
  }

  obtenerPedidoDetalle(cnum_doc: string, motivo: string) {
    return this.http.post<PedidoDetalle[]>(this.rutaApi + '/obtener_pedido_detalle_v2', { codigo_empresa: this.loginService.codigo_empresa, cnum_doc, motivo }).toPromise()
  }

  subir_archivos(imagen: FormData, fecha: string, motivo_venta: string, numero_pedido: string) {
    imagen.append('ccod_empresa', this.loginService.codigo_empresa);
    imagen.append('fecha', fecha);
    imagen.append('ruc_empresa_usuario', this.loginService.ruc_empresa_usuario);
    imagen.append('ccod_almacen', this.loginService.ccod_almacen);
    imagen.append('motivo_venta', motivo_venta);
    imagen.append('numero_pedido', numero_pedido);
    return this.http
      .post<any>(this.urlArchivos + '/subir_archivos/subirimagen', imagen)
      .toPromise();
  }

  listaPedidosPendientes(inicio: number, limite: number, texto: string, fechaInicio: string, fechaFinal: string, busqueda: string) {

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

    return this.http.post<any[]>(this.rutaApi + '/lista_documentos_pendientes/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarDetallePedidioPendiente(codigoPuntoVenta: string, codigoMotivo: string, numero: string) {

    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta: codigoPuntoVenta,
      codigo_motivo: codigoMotivo,
      numero: numero,
    };

    return this.http.post<any[]>(this.rutaApi + '/lista_detalle_pendientes/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarPedidioPendiente(codigoPuntoVenta: string, codigoMotivo: string, numero: string) {

    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta: codigoPuntoVenta,
      codigo_motivo: codigoMotivo,
      numero_documento: numero,
    };

    return this.http.post<any[]>(this.rutaApi + '/consular_documento_pendiente/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarPedido(motivo_documento: string, numero_documento: string, codigo_punto_venta: string) {
   
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      motivo_documento,
      numero_documento,
      codigo_punto_venta,
    };

    return this.http.post<any[]>(this.rutaApi + '/consultar/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  listaPedAprobacion(inicio: number, limite: number, texto: string, fechaInicio: string, fechaFinal: string, estado: string, codigoCencos: string, codigoUnidad: string, busqueda: string) {
  
    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      inicio,
      limite,
      texto,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      busqueda,
      codigo_punto_venta: this.loginService.datosUsu.punto_venta,
      codigo_usuario: this.loginService.codigo_usuario,
      codigo_vendedor: this.loginService.objVendedor.ccod_vendedor,
      centro_costos: codigoCencos,
      unidad_negocios: codigoUnidad,
      estado_aprobacion: estado,
    };

    return this.http.post<any[]>(this.rutaApi + '/lista_documentos_aprobacion/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
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

    return this.http.post<any[]>(this.rutaApi + '/aprobaciones/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

}
