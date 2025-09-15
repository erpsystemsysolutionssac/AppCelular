import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Articulo, Cliente, dataBonificado } from 'src/app/interfaces/interfases';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { CarritoService } from './carrito.service';

@Injectable({
  providedIn: 'root',
})
export class ArticuloService {
  public listaPrecioCliente: string = '';
  public eventSeleccionArticulo = new BehaviorSubject<boolean>(false);

  public datosArticulo: any;
  private rutaPedidos = this.toolsService.obtenerUrl('url') + '/tomadorPedidos';

  private ruta = this.toolsService.obtenerUrl('urlApi') + '/productos/app/v1';
  private rutaApi = this.toolsService.obtenerUrl('urlApi');
  private rutaArchivos = this.toolsService.obtenerUrl('urlArchivos');

  private customHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  private params = new HttpParams();

  public subject = new Subject<any>();

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private carritoS: CarritoService,
    private globalService: GlobalService,
    private toolsService: ToolsService

  ) {
    console.log('constructor articulol service')
   }

  refrescar() {
    this.subject.next(true);;
  }

  listaArticulosDetalle(
    limite: number,
    inicio: number,
    punto_venta: string,
    texto: string,
    filtro: string,
    tipoListaPrecios: string,
  ): Observable<Articulo[]> {
    let tipo: string;
    let codLista: string;

    tipo = '12'

    switch (this.loginService.codigo_empresa) {
      case "0000000033":
        /* Configuración para Lubricantes*/
        if (tipoListaPrecios == "lista_precios_provincia") {
          codLista = "rango"
        } else {
          if (tipoListaPrecios == "lista_precios_lima") {
            codLista = "04"
          } else {
            codLista = tipoListaPrecios;
          }
        }
        break;
      default:
        /* Configuración para ERP*/
        if (tipoListaPrecios == "lista_precios_provincia") {
          codLista = "02"
        } else {
          if (tipoListaPrecios == "lista_precios_lima") {
            codLista = "01"
          } else {
            codLista = tipoListaPrecios;
          }
        }
        break;
    }

    return this.http.post<Articulo[]>(
      this.rutaPedidos + '/lista_articulo_detalle_v2',
      {
        codigo_empresa: this.loginService.codigo_empresa,
        limite,
        inicio,
        punto_venta,
        texto,
        filtro,
        tipo,
        codLista,
        codigo_usuario: this.loginService.codigo_usuario
      },
      this.customHeaders
    );

    return this.http.post<Articulo[]>(
      this.rutaPedidos + '/lista_articulo_detalle',
      {
        codigo_empresa: this.loginService.codigo_empresa,
        limite,
        inicio,
        punto_venta,
        texto,
        filtro,
        tipo,
        codLista,
      },
      this.customHeaders
    );
  }

  reListarPrecios(articulos: Articulo[], cliente: Cliente) {
    return this.http
      .post(
        this.rutaPedidos + '/relistar_precios',
        {
          codigo_empresa: this.loginService.codigo_empresa,
          articulos,
          cliente,
          punto_venta: this.loginService.punto_venta,
        },
        this.customHeaders
      )
      .toPromise();
  }

  buscarArticulo(
    codigo_empresa: string,
    ccod_articulo: string,
    punto_venta: string
  ) {
    return this.http.post<any>(
      this.rutaPedidos + '/buscar_articulo',
      { codigo_empresa, ccod_articulo, punto_venta },
      this.customHeaders
    );
  }

  cambiarImagen(imagen: FormData, fecha: string) {
    imagen.append('ccod_empresa', this.loginService.codigo_empresa);
    imagen.append('usuario', this.loginService.codigo_usuario);
    imagen.append('fecha', fecha);
    return this.http
      .post<any>(this.rutaArchivos + '/cambiar_imagen', imagen)
      .toPromise();
  }

  listarFamilias() {
    return this.http
      .post<any>(
        this.rutaPedidos + '/lista_familias',
        { codigo_empresa: this.loginService.codigo_empresa },
        this.customHeaders
      )
      .toPromise();
  }

  setListaPrecioCliente(listaPrecioCliente) {
    this.listaPrecioCliente = listaPrecioCliente;
  }

  getListaPrecioCliente() {
    return this.listaPrecioCliente;
  }

  listaBonificaciones(articulo: any, fecha: string){
    console.log(articulo);
    return this.http.post<any[]>(this.ruta + '/lista_bonificaciones/' + this.globalService.calcularNumeroRandomUrl(), { codigo_empresa: this.loginService.codigo_empresa, codigo_articulo: articulo.codigo, fecha}, this.customHeaders).toPromise();
  }

  articuloBonificado(dataBonificado: dataBonificado){
    console.log(dataBonificado);
    let body = {
      codigo_empresa: this.loginService.codigo_empresa, 
      codigo_articulo: dataBonificado.codigo_articulo, 
      fecha: dataBonificado.fecha,
      listaPrecio: dataBonificado.listaPrecio, 
      monedaDocumento: dataBonificado.monedaDocumento, 
      tipoCambio: dataBonificado.tipoCambio, 
      puntoVenta: dataBonificado.puntoVenta,
      cantidad_articulo: dataBonificado.cantidad_articulo
    }
    return this.http.post<any[]>(this.rutaApi + '/productos/bonificaciones/' + this.globalService.calcularNumeroRandomUrl(), body, this.customHeaders).toPromise();
  }
}
