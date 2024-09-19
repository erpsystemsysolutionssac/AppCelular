import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {

  private ruta = this.toolsService.obtenerUrl('urlApi') + '/configuraciones/app/v1';
  private rutaApi = this.toolsService.obtenerUrl('urlApi');

  private customHeaders = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    }),
  };

  private customHeadersHTML = {
    headers: new HttpHeaders({
        'Content-Type': 'text/html; charset=utf-8',
    }),
  };

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private globalService: GlobalService,
    private toolsService: ToolsService
  ) { }

  configuracionesCompras(): Observable<any[]> {
    return this.http.post<any>(this.ruta + '/configuracion_compras/' + this.globalService.calcularNumeroRandomUrl(), {codigo_empresa: this.loginService.codigo_empresa}, this.customHeaders)
  }

  consultarFormatoImpresion(modulo: string, tipoFormato: string, codigoPuntoVenta: string, tipoDocumento: string, motivoSerieDocumento: string) {
    let body = {
      codigo_empresa: this.loginService.codigo_empresa,
      modulo: modulo,
      tipo_formato: tipoFormato,
      punto_venta: codigoPuntoVenta,
      tipo_documento: tipoDocumento,
      motivo_serie_documento: motivoSerieDocumento
    }

    return this.http.post(this.rutaApi + '/configuraciones/formato_impresion/' + this.globalService.calcularNumeroRandomUrl(), body, { responseType: 'text' }).toPromise()
  }

  async downloadPDF(nombreCarpeta: string, nombreArchivo: string) {
    let body = {
      codigo_empresa: this.loginService.codigo_empresa,
      ruc_empresa: this.loginService.ruc_empresa_usuario,
      nombreCarpeta: nombreCarpeta,
      nombreArchivo: nombreArchivo,
    };

    const response = await this.http.post<any>(this.rutaApi + '/formato_impresion/convertirPDFaBlob/' + this.globalService.calcularNumeroRandomUrl(), body, { responseType: 'json' }).toPromise();

    const pdfBlob = response.dataBlob; 
    const fileName = nombreArchivo+'.pdf';

    return response;
    // Guarda el PDF en el sistema de archivos local
    // const { uri } = await Filesystem.writeFile({
    //   path: fileName,
    //   data: ''+pdfBlob,
    //   directory: Directory.Documents
    // });

    // return uri;
  }

  subirArchivos(modulo: string, nombreArchivo: string, base64: string) {
    let fechaTrabajo = new Date(this.loginService.datosUsu.fecha_trabajo_sistema);
    let ejercicio = fechaTrabajo.getUTCFullYear();
    let periodo = (fechaTrabajo.getUTCMonth() + 1).toString();
    periodo = (periodo.toString().length > 1)? periodo: '0'+periodo;
   
    let body = {
      codigo_empresa: this.loginService.codigo_empresa,
      ruc_empresa: this.loginService.ruc_empresa_usuario,
      modulo: modulo,
      ejercicio: ejercicio,
      periodo: periodo,
      nombreArchivo: nombreArchivo,
      base64: base64
    }

    return this.http.post<any>(this.rutaApi + '/formato_impresion/cargarArchivos/'+ this.globalService.calcularNumeroRandomUrl(), body, { responseType: 'json' }).toPromise();
  }
}
