import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/almacen/app/v1';

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

  listaAlmacenPuntoVenta(codigoPuntoVenta: string) {
    let codigoEmpresa = this.loginService.codigo_empresa;

    return this.http.get<any[]>(this.ruta + '/almacen_punto_venta/'+codigoEmpresa+'/'+codigoPuntoVenta+'/'+this.globalService.calcularNumeroRandomUrl(), {}).toPromise();
  }
}
