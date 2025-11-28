import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { GlobalService } from '../global.service';
import { Subject } from 'rxjs';
import { FacturaCabecera, FacturaDetalle } from 'src/app/interfaces/factura';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private rutaApi = this.toolsService.obtenerUrl('urlApi');

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private toolsService: ToolsService,
    private globalService: GlobalService
  ) { }

  registrarTicket(numero_ticket: string) {
    return this.http.post<FacturaCabecera[]>(this.rutaApi + '/generacion_tickets/consumir_ticket/1', { codigo_empresa: this.loginService.codigo_empresa, numero_ticket: numero_ticket }).toPromise()
  }
  
  registrarTicketPrueba(numero_ticket: string) {
    return this.http.post<FacturaCabecera[]>(this.rutaApi + '/generacion_tickets/consumir_ticket/1', { codigo_empresa: this.loginService.codigo_empresa, numero_ticket: numero_ticket }).toPromise()
  }

}
