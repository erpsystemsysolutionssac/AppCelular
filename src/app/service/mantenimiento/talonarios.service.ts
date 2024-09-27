import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login.service';
import { GlobalService } from '../global.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class TalonariosService {
  private ruta = this.toolsService.obtenerUrl('urlApi') + '/talonarios/app/v1';

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

  listaTalonarios(tipoDocumento: string) {
    return this.http.post<any>(this.ruta + '/serie_documento/' + this.globalService.calcularNumeroRandomUrl(), {
      codigo_empresa: this.loginService.codigo_empresa,
      punto_venta: this.loginService.punto_venta,
      tipo_documento: tipoDocumento,
    }, this.customHeaders).toPromise();

    return this.http.post<any[]>(this.ruta + '/serie_documento/' + this.globalService.calcularNumeroRandomUrl(), {
      codigo_empresa: this.loginService.codigo_empresa,
      punto_venta: this.loginService.punto_venta,
      tipo_documento: tipoDocumento,
    },
      this.customHeaders
    );
  }
}
