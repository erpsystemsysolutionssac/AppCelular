import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { Articulo, Cliente, Direcciones, Agencias, FormaPago, Moneda, filtroListaPrecio } from 'src/app/interfaces/interfases';
import { MontoTotalesVenta } from 'src/app/interfaces/monto-totales-venta';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { CalculosService } from '../utilitarios/calculos.services';
import { ArticuloService } from './articulo.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  public arrayCarrito: DetalleVenta[] = [];
  public montoTotalesVenta: MontoTotalesVenta = { SubTotal_Sin_Descuentos: 0, Descuentos: 0, SubTotal_Con_Descuentos: 0, SubTotal_Con_Descuentos_Con_Anticipos: 0, Igv: 0, Icbper: 0, Total: 0, Total_Percepcion: 0, Importe: 0 };

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

  constructor(
    private toolsService: ToolsService,
    private http: HttpClient,
    private loginService: LoginService,
    private calculosService: CalculosService
  ) {
    console.log('CarritoService: ', this.loginService.getModulo())
    let dataCarrito = localStorage.getItem('arrCarrito_' + this.loginService.getModulo());
    let dataCliente = localStorage.getItem('objCliente_' + this.loginService.getModulo());

    this.arrayCarrito = []

    if (JSON.parse(dataCarrito)) {
      this.arrayCarrito = JSON.parse(dataCarrito);
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

  agregarCarritov2(detalleVenta: DetalleVenta) {
    this.arrayCarrito.push(detalleVenta);

    this.calcularDetalleVenta();

    console.log(this.arrayCarrito);
  }

  calcularDetalleVenta() {
    let percepcion: number = 0;
    const isMasIgv = this.masIgv == 'S' ? true : false;
    this.montoTotalesVenta = { SubTotal_Sin_Descuentos: 0, Descuentos: 0, SubTotal_Con_Descuentos: 0, SubTotal_Con_Descuentos_Con_Anticipos: 0, Igv: 0, Icbper: 0, Total: 0, Total_Percepcion: 0, Importe: 0 };

    this.arrayCarrito.forEach(element => {
      let calculos = this.calculosService.calcular_totales_ventas(isMasIgv, element.Cantidad, element.Unit, element.Igv_Art, 0, element.Desc1, element.Desc2, element.Desc3, element.Desc4, false, element.tipo_descuento, 'BC');
      percepcion = calculos.Total * element.Perpecion_porc / 100
      // console.log(calculos);
      element.Base_Calculada = this.toolsService.redondear(calculos.SubTotal_Sin_Descuentos, 2);
      element.Base_calculada_dec = this.toolsService.redondear(calculos.SubTotal_Sin_Descuentos, 2);
      element.Base_Imponible = this.toolsService.redondear(calculos.SubTotal_Con_Descuentos, 2);
      element.Base_imp_dec = this.toolsService.redondear(calculos.SubTotal_Con_Descuentos, 2);
      element.Igv = this.toolsService.redondear(calculos.Igv, 2);
      element.Igv_dec = this.toolsService.redondear(calculos.Igv, 2);
      element.Importe = this.toolsService.redondear(calculos.Total, 2);
      element.Importe_dec = this.toolsService.redondear(calculos.Total, 2);
      element.Percepcion_uni = this.toolsService.redondear((calculos.Total * element.Perpecion_porc) / 100, 2);
      element.Monto_Descuento = this.toolsService.redondear(calculos.Descuentos_SubTotal, 2);
      element.Cantidad_Kardex = element.Cantidad * element.Factor;
      element.PesoTotal = element.Peso * element.Cantidad * element.Factor;

      this.montoTotalesVenta.SubTotal_Sin_Descuentos += this.toolsService.redondear(calculos.SubTotal_Sin_Descuentos, 2);
      this.montoTotalesVenta.SubTotal_Con_Descuentos += this.toolsService.redondear(calculos.SubTotal_Con_Descuentos, 2);
      this.montoTotalesVenta.Descuentos += this.toolsService.redondear(calculos.Descuentos_SubTotal, 2);
      this.montoTotalesVenta.Igv += this.toolsService.redondear(calculos.Igv, 2);
      this.montoTotalesVenta.Icbper += this.toolsService.redondear(calculos.ICBPER, 2);
      var total_unit = this.toolsService.redondear(calculos.Total, 2)
      var decimales_precio = 2;

      this.montoTotalesVenta.Total += parseFloat(total_unit.toFixed(decimales_precio));
      this.montoTotalesVenta.Importe += parseFloat(total_unit.toFixed(decimales_precio));
      this.montoTotalesVenta.Total_Percepcion += percepcion;
    });
    console.log('calcularDetalleVenta: ', this.loginService.getModulo(), this.montoTotalesVenta)
    localStorage.setItem('arrCarrito_' + this.loginService.getModulo(), JSON.stringify(this.arrayCarrito));
  }

  agregarCliente(cliente: Cliente) {
    Object.assign(this.objCliente, cliente)
    this.arrFormasPago = []
    this.arrDirecciones = []
    this.arrAgencias = []
    this.arrDirecciones.push(...this.objCliente.direcciones)
    this.arrAgencias.push(...this.objCliente.agencias)
    this.arrFormasPago.push(...this.objCliente.forma_pagos)

    localStorage.setItem('objCliente_' + this.loginService.getModulo(), JSON.stringify(this.objCliente));
  }

  redondear(monto: number): number {
    return Math.round((monto + Number.EPSILON) * 100) / 100
  }

  listaTipoDocumento() {
    return this.http.post<any>(this.rutaPedidos + '/obtener_tipo_doc' + this.random, {
      codigo_empresa: this.loginService.codigo_empresa
    }, this.customHeaders).toPromise()
  }

  listaTalonar() {
    return this.http.post<any>(this.rutaPedidos + '/lista_talonar' + this.random, {
      codigo_empresa: this.loginService.codigo_empresa,
      ccod_almacen: this.loginService.punto_venta
    }, this.customHeaders).toPromise()
  }

  listaFormaPago() {
    return this.http.post<any>(this.rutaPedidos + '/lista_forma_pago' + this.random, {
      codigo_empresa: this.loginService.codigo_empresa
    }, this.customHeaders).toPromise()
  }

  async tipoCambio() {

    return this.http.post<any>(this.rutaPedidos + '/obtener_tipo_cambio' + this.random, {
      codigo_empresa: this.loginService.codigo_empresa
    }, this.customHeaders)
      .subscribe((resp) => {
        this.tipoCambioVenta = resp.ntc_venta
      })
  }

  async configuracionesVentas() {

    return this.http.post<any>(this.rutaPedidos + '/configuraciones_ventas' + this.random, {
      codigo_empresa: this.loginService.codigo_empresa
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

  guardarPedido(dataPedido: any) {
    return this.http.post<any>(this.rutaApi + '/pedido/app/v1/guardar' + this.random, dataPedido, this.customHeaders).toPromise()
  }

  guardarGuiaRemision(dataGuiaRemision: any) {
    return this.http.post<any>(this.rutaApi + '/guia/app/v1/guardar' + this.random, dataGuiaRemision, this.customHeaders).toPromise()
  }


  guardarFactura(dataFactura: any) {
    return this.http.post<any>(this.rutaApi + '/facturacion/app/v1/guardar' + this.random, dataFactura, this.customHeaders).toPromise()
  }

  getTotalItems() {
    return this.arrayCarrito.length;
  }
}
