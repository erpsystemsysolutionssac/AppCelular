import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root',
})
export class ListaDespachosService {

  public eventFinalizarEntrega = new BehaviorSubject<boolean>(false);

  private ruta = this.toolsService.obtenerUrl('urlApi'); 

  private customHeaders = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private toolsService: ToolsService
  ) {}

  listaDespachos(fechaBusqueda: string, documentosAtendidos: boolean): Observable<any[]> {

    const atendidos = documentosAtendidos ? 'ATENDIDO' : 'TODOS'; 

    return this.http.post<any[]>(
      this.ruta + '/despacho/app/v1/documentos_consolidados',
      {
        codigo_empresa: this.loginService.codigo_empresa,
        fechaBusqueda: fechaBusqueda,
        atendidos: atendidos
      },
      this.customHeaders
    );
  };

  listaDetalleDocumentoDespachos(documento_desp_punto_venta: string, documento_desp_motivo: string, documento_desp_numero: string, documento_motivo: string, documento_serie: string, documento_numero: string): Observable<any[]> {

    return this.http.post<any[]>(
      this.ruta + '/despacho/app/v1/detalle_documentos_consolidados',
      {
        codigo_empresa: this.loginService.codigo_empresa,
        desp_punto_venta: documento_desp_punto_venta,
        desp_motivo: documento_desp_motivo,
        desp_numero: documento_desp_numero,
        doc_motivo: documento_motivo, 
        doc_serie: documento_serie,
        doc_numero: documento_numero
      },
      this.customHeaders
    );
  };

  entregarPedido(articulos_entregados){
    return this.http.post<any[]>(
      this.ruta + '/despacho/app/v1/entregar_pedido_documento',{
        codigo_empresa: this.loginService.codigo_empresa,
        articulos_entregados: articulos_entregados
      },
      this.customHeaders
    )
  }
}
