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
export class UnidadNegocioService {

  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/unidad_negocios/app/v1';

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

  listaUnidadNegocio(): Observable<any[]> {
    return this.http.post<any[]>(this.ruta + '/lista_small/'+this.globalService.calcularNumeroRandomUrl(), {codigo_empresa: this.loginService.codigo_empresa},this.customHeaders);
  }
}
