import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login.service';
import { GlobalService } from '../global.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class TransportistaService {
  private ruta = this.toolsService.obtenerUrl('urlApi')+ '/transportista/app/v1';

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

  listaTransportistas(){
    return this.http.post<any[]>(this.ruta + '/lista/'+this.globalService.calcularNumeroRandomUrl(), {
      codigo_empresa: this.loginService.codigo_empresa,
  },
      this.customHeaders
  );
  }
}
