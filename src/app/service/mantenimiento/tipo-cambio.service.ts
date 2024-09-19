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
export class TipoCambioService {

  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/tipo_cambio/app/v1';

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

  consultarTipoCambio(tipoCambio: string, fecha: string): Observable<any> {
    return this.http.post<any>(this.ruta + '/tasa_cambio/'+this.globalService.calcularNumeroRandomUrl(), {codigo_empresa: this.loginService.codigo_empresa, tipo_cambio: tipoCambio, fecha: fecha}, this.customHeaders);
  }
}
