import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { GlobalService } from '../global.service';
import { Subject } from 'rxjs';
import { FacturaCabecera, FacturaDetalle } from 'src/app/interfaces/factura';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  private urlArchivos = this.toolsService.obtenerUrl('urlArchivos') + '/pedidos'
  private rutaApi = this.toolsService.obtenerUrl('urlApi');

  public facturaCabecera: FacturaCabecera = {}
  public _refresh$ = new Subject<any>();

  public rutaClientes: FacturaCabecera[] = []

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private toolsService: ToolsService,
    private globalService: GlobalService
  ) { }

  refresh() {
    this._refresh$.next()
  }

  obtenerFacturas(inicio: number, limite: number, filtro: string[], campo: string) {
    return this.http.post<FacturaCabecera[]>(this.rutaApi + '/facturacion/app/v1/obtener_facturas', { codigo_empresa: this.loginService.codigo_empresa, inicio, limite, vendedor: this.loginService.objVendedor.ccod_vendedor, filtro, campo }).toPromise()
  }

  obtenerFacturaDetalle(cnum_doc: string, motivo: string) {
    return this.http.post<FacturaDetalle[]>(this.rutaApi + '/facturacion/app/v1/obtener_factura_detalle_v2', { codigo_empresa: this.loginService.codigo_empresa, cnum_doc, motivo }).toPromise()
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

    return this.http.post<any[]>(this.rutaApi + '/pedido/app/v1/lista_documentos_pendientes/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }

  consultarPedidioPendiente(codigoPuntoVenta: string, codigoMotivo: string, numero: string) {

    const body = {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta: codigoPuntoVenta,
      codigo_motivo: codigoMotivo,
      numero_documento: numero,
    };

    return this.http.post<any[]>(this.rutaApi + '/pedido/app/v1/consular_documento_pendiente/' + this.globalService.calcularNumeroRandomUrl(), body).toPromise()
  }
}
