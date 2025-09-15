import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Articulo, Cliente } from 'src/app/interfaces/interfases';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
    providedIn: 'root',
})
export class AgenciaTransporteService {
    public eventSeleccionArticulo = new BehaviorSubject<boolean>(false);

    private ruta = this.toolsService.obtenerUrl('urlApi');

    private customHeaders = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    private params = new HttpParams();
    public subject = new Subject<any>();

    constructor(
        private http: HttpClient,
        private loginService: LoginService,
        private toolsService: ToolsService
    ) { }

    refrescar() {
        this.subject.next(true);;
    }

    listaAgenciasTransportes(texto: string): Observable<Articulo[]> {
        return this.http.post<Articulo[]>(
            this.ruta + '/agencia_transporte/app/v1/lista', {
            codigo_empresa: this.loginService.codigo_empresa,
            texto
        },
            this.customHeaders
        );
    }

    agregarAgencia(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/agencia_transporte/app/v1/guardar' + this.random(), { ...datos }).toPromise()
    }

    editarAgencia(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/agencia_transporte/app/v1/modificar' + this.random(), { ...datos }).toPromise()
    }

    eliminarAgencia(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/agencia_transporte/app/v1/eliminar' + this.random(), { ...datos }).toPromise()
    }

    consultarAgencia(ccod_agencia: string) {
        return this.http.post<any[]>(this.ruta + '/agencia_transporte/app/v1/consultar', { ccod_empresa: this.loginService.codigo_empresa, ccod_agencia }).toPromise()
    }

    random() {
        return '/' + new Date().getTime()
    }

}
