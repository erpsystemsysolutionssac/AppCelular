import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Articulo } from 'src/app/interfaces/articulo';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
    providedIn: 'root',
})
export class ProductoService {
    public listaPrecioCliente: string = '';
    public eventSeleccionArticulo = new BehaviorSubject<boolean>(false);

    public arrayProductos: Articulo[] = []

    private ruta = this.toolsService.obtenerUrl('urlApi') + '/productos/app/v1';

    private customHeaders = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
    };

    public subject = new Subject<any>();

    constructor(
        private http: HttpClient,
        private loginService: LoginService,
        private toolsService: ToolsService,
        private globalService: GlobalService
    ) { }

    listaArticulosDetalle(limite: number, inicio: number, punto_venta: string, texto: string, filtro: string, tipoListaPrecios: string ): Observable<Articulo[]> {
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
        console.log('codigo_empresa: '+ this.loginService.codigo_empresa, limite, inicio, punto_venta, texto, filtro, tipo, 'Lista Precio: '+ codLista,' codigo_usuario: '+ this.loginService.codigo_usuario)
        return this.http.post<Articulo[]>(this.ruta + '/lista_articulo_detalle_v2',{ codigo_empresa: this.loginService.codigo_empresa, limite, inicio, punto_venta, texto, filtro, tipo, codLista, codigo_usuario: this.loginService.codigo_usuario }, this.customHeaders);
    }

    listaBonificaciones(articulo: any, fecha: string){
        console.log(articulo);
        return this.http.post<any[]>(this.ruta + '/lista_bonificaciones/' + this.globalService.calcularNumeroRandomUrl(), { codigo_empresa: this.loginService.codigo_empresa, codigo_articulo: articulo.codigo, fecha}, this.customHeaders).toPromise();
    }

    cambiarImagen(imagen: FormData, fecha: string) {
        imagen.append('ccod_empresa', this.loginService.codigo_empresa);
        imagen.append('usuario', this.loginService.codigo_usuario);
        imagen.append('fecha', fecha);
        return this.http
          .post<any>(this.ruta + '/cambiar_imagen', imagen)
          .toPromise();
    }

    setListaPrecioCliente(listaPrecioCliente) {
        this.listaPrecioCliente = listaPrecioCliente;
    }
    
    getListaPrecioCliente() {
        return this.listaPrecioCliente;
      }

    refrescar() {
        this.subject.next();
    }
}