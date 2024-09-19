import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Articulo, Cliente, Direcciones, Agencias, FormaPago, Moneda, filtroListaPrecio } from 'src/app/interfaces/interfases';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { ArticuloService } from './articulo.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  public arrCarrito: Articulo[]
  public arrfiltroListaPrecio: filtroListaPrecio[] = []
  public objCliente: Cliente = {}
  public carritoSubTotal_SinDescuento: number = 0
  public carritoSubTotal_ConDescuento: number = 0
  public carritoIGV: number = 0
  public carritoMontoTotal: number = 0
  public carritoMontoTotal_Descontado: number = 0
  public carritoDescuento: number = 0
  public arrFormasPago: FormaPago[] = []
  public arrDirecciones: Direcciones[] = []
  public arrAgencias: Agencias[] = []
  public codVendedor: any
  public tipoCambioVenta: number
  public masIgv: string = 'N';

  public documentoPendienteSeleccionado: any;

  private rutaPedidos = this.toolsService.obtenerUrl('url') + '/tomadorPedidos'
  private customHeaders = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  private random = '/' + new Date().getTime()
  private rutaApi = this.toolsService.obtenerUrl('urlApi');

  public modulo: string;

  constructor(
    private toolsService: ToolsService, 
    private http: HttpClient, 
    private loginS: LoginService
  ) {
    this.modulo = localStorage.getItem('modulo');
    let dataCarrito = localStorage.getItem('arrCarrito_'+this.modulo);
    let dataCliente = localStorage.getItem('objCliente_'+this.modulo);
  
    this.arrCarrito = []

    if (JSON.parse(dataCarrito)) {
      this.arrCarrito = JSON.parse(dataCarrito);
    }

    if (JSON.parse(dataCliente)) {
      this.objCliente = JSON.parse(dataCliente);
      this.arrFormasPago = []
      this.arrDirecciones = []
      this.arrAgencias = []
      if (this.objCliente.ccod_cliente) {
        this.arrDirecciones.push(...this.objCliente.direcciones)
        this.arrAgencias.push(...this.objCliente.agencias)
        this.arrFormasPago.push(...this.objCliente.forma_pagos)
      }
    }

    this.tipoCambio()
    this.configuracionesVentas()
  }

  agregarfiltroListaPrecio(filtroListaPrecio: filtroListaPrecio) {
    this.arrfiltroListaPrecio[0] = filtroListaPrecio;

  }

  limpiarCarrito() {
    this.arrCarrito = [];
  }
  agregarCarrito(articulo: Articulo) {
    console.log(articulo);
    this.arrCarrito.push(articulo)
    this.calcularMontoTotal()
  }


  calcularMontoTotal() {
    this.carritoMontoTotal = 0
    this.carritoMontoTotal_Descontado = 0
    this.carritoDescuento = 0
    let montoIGVTotal = 0;
    this.arrCarrito.forEach((articulo) => {
      let montoDolar = 0
      if (articulo.moneda == '$') {
        montoDolar = this.toolsService.redondear(articulo.listaPrecios[0].monto * this.tipoCambioVenta)
        if (articulo.descuentoPromo == 100) {
          this.carritoDescuento += montoDolar
        }
        this.carritoMontoTotal += montoDolar
      } else {
        if (articulo.descuentoPromo == 100) {
          this.carritoDescuento += this.toolsService.redondear(articulo.listaPrecios[0].monto)
        }

        this.carritoMontoTotal += this.toolsService.redondear(articulo.listaPrecios[0].monto)

        if (this.masIgv == 'S') {
          if (articulo.descuentoPromo != 100) {
            montoIGVTotal += this.toolsService.redondear(articulo.listaPrecios[0].monto * (articulo.nigv / 100), 2);
          }
        }
      }

      this.carritoMontoTotal = this.toolsService.redondear(this.carritoMontoTotal,2)

    })
    montoIGVTotal = this.toolsService.redondear(montoIGVTotal, 2);
  
    if (this.masIgv == 'S') {
      this.carritoMontoTotal_Descontado = this.toolsService.redondear(this.toolsService.redondear(this.carritoMontoTotal + montoIGVTotal) - this.carritoDescuento,2)
    } else {
      this.carritoMontoTotal_Descontado = this.toolsService.redondear(this.toolsService.redondear(this.carritoMontoTotal) - this.carritoDescuento,2)
    }

    localStorage.setItem('arrCarrito_'+this.modulo, JSON.stringify(this.arrCarrito));
  }

  agregarCliente(cliente: Cliente) {
    Object.assign(this.objCliente, cliente)
    this.arrFormasPago = []
    this.arrDirecciones = []
    this.arrAgencias = []
    this.arrDirecciones.push(...this.objCliente.direcciones)
    this.arrAgencias.push(...this.objCliente.agencias)
    this.arrFormasPago.push(...this.objCliente.forma_pagos)

    localStorage.setItem('objCliente_'+this.modulo, JSON.stringify(this.objCliente));
  }
  redondear(monto: number): number {
    return Math.round((monto + Number.EPSILON) * 100) / 100
  }

  listaTipoDocumento() {
    return this.http.post<any>(this.rutaPedidos + '/obtener_tipo_doc' + this.random, {
      codigo_empresa: this.loginS.codigo_empresa
    }, this.customHeaders).toPromise()
  }
  listaTalonar() {
    return this.http.post<any>(this.rutaPedidos + '/lista_talonar' + this.random, {
      codigo_empresa: this.loginS.codigo_empresa,
      ccod_almacen: this.loginS.punto_venta
    }, this.customHeaders).toPromise()
  }
  listaFormaPago() {
    return this.http.post<any>(this.rutaPedidos + '/lista_forma_pago' + this.random, {
      codigo_empresa: this.loginS.codigo_empresa
    }, this.customHeaders).toPromise()
  }

  async tipoCambio() {

    return this.http.post<any>(this.rutaPedidos + '/obtener_tipo_cambio' + this.random, {
      codigo_empresa: this.loginS.codigo_empresa
    }, this.customHeaders)
      .subscribe((resp) => {
        this.tipoCambioVenta = resp.ntc_venta
      })
  }

  async configuracionesVentas() {

    return this.http.post<any>(this.rutaPedidos + '/configuraciones_ventas' + this.random, {
      codigo_empresa: this.loginS.codigo_empresa
    }, this.customHeaders)
      .subscribe((resp) => {
        if (resp.length > 0) {
          this.masIgv = resp[0].mas_igv;
        }
      })
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

  crearPedido(cabecera: any, detalle: any) {
    let datos = { ...cabecera, ...detalle }
    datos.codigo_empresa = this.loginS.codigo_empresa
    datos.codigo_punto_venta = this.loginS.punto_venta
    datos.anio = new Date().getFullYear()


    datos.vendedor_1 = this.loginS.objVendedor.ccod_vendedor


    datos.codigo_centro_costos = this.loginS.centro_costo
    datos.codigo_unidad_negocio = this.loginS.unidad_negocio
    datos.pto_partida = this.loginS.datosUsu.cdireccion
    datos.codigo_usuario = this.loginS.codigo_usuario

    return this.http.post<any>(this.rutaPedidos + '/guardar_pedido' + this.random, {
      ...datos
    }, this.customHeaders).toPromise()
  }

  crearGuiaRemision(cabecera: any, detalle: any) {
    let datos = { ...cabecera, ...detalle }
    datos.codigo_empresa = this.loginS.codigo_empresa
    datos.codigo_punto_venta = this.loginS.punto_venta
    datos.anio = new Date().getFullYear()


    datos.vendedor_1 = this.loginS.objVendedor.ccod_vendedor


    datos.codigo_centro_costos = this.loginS.centro_costo
    datos.codigo_unidad_negocio = this.loginS.unidad_negocio
    datos.pto_partida = this.loginS.datosUsu.cdireccion
    datos.codigo_usuario = this.loginS.codigo_usuario
    datos.ruc_empresa_usuario = this.loginS.ruc_empresa_usuario;
    datos.omitirVentaPrecioCosto = 'S';

    return this.http.post<any>(this.rutaApi + '/guia/app/v1/guardar' + this.random, {
      ...datos
    }, this.customHeaders).toPromise()
  }
}
