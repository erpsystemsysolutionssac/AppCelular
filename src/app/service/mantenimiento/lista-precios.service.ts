import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class ListaPreciosService {

  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/lista_precios/app/v1';

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
  ) { }

  listaPrecios(tipo: string): Observable<any[]> {
    return this.http.post<any[]>(this.ruta + '/lista/'+this.globalService.calcularNumeroRandomUrl(), {codigo_empresa: this.loginService.codigo_empresa, tipo: tipo},this.customHeaders);
  }

  listaGeneralPrecios(codigoPuntoVenta: string, codigoAlmacen: string, tipo: string, moneda: string, textoBusqueda: string, limite: number, inicio: number){
    let body = {
      codigo_empresa: this.loginService.codigo_empresa, 
      punto_venta: codigoPuntoVenta,
      almacen: codigoAlmacen,
      tipo: tipo,
      moneda: moneda,
      textoBusqueda: textoBusqueda,
      limite,
      inicio
    };

    return this.http.post<any[]>(this.ruta + '/lista_generalv2/'+this.globalService.calcularNumeroRandomUrl(), body, this.customHeaders).toPromise();
  }
}
