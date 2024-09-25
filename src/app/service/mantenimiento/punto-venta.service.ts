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
export class PuntoVentaService {

  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/punto_venta/app/v1';

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

  listaPuntoVenta(texto: string): Observable<any[]> {
    return this.http.post<any[]>(this.ruta + '/lista/'+this.globalService.calcularNumeroRandomUrl(), {
        codigo_empresa: this.loginService.codigo_empresa,
        texto
    },
        this.customHeaders
    );
  }

  datosPuntoVenta(codigo_punto_venta: string){
    return this.http.post<any[]>(this.ruta + '/datos/'+this.globalService.calcularNumeroRandomUrl(), {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta
  },
      this.customHeaders
  );
  }
}
