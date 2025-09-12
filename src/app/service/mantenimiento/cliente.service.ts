import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Articulo } from 'src/app/interfaces/articulo';
import { Agencias, Cliente, Direcciones, FormaPago } from 'src/app/interfaces/cliente';
import { Ubigeo } from 'src/app/interfaces/interfases';
import { GlobalService } from '../global.service';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
    providedIn: 'root',
})
export class clienteService {
    public clientesOn = false

    private ruta = this.toolsService.obtenerUrl('urlApi') + '/clientes/app/v1';
    private rutaApi = this.toolsService.obtenerUrl('urlApi');

    public _refresh$ = new Subject<any>()

    private customHeaders = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    public subject = new Subject<any>();

    constructor(
        private http: HttpClient,
        private loginService: LoginService,
        private toolsService: ToolsService,
        private globalService: GlobalService
    ) { }

    refresh() {
        this._refresh$.next()
    }
    
    listarClientes(limite: number, inicio: number, filtro: string, texto: string) {
        const codigoVendedor = this.loginService.objVendedor.ccod_vendedor || '';
        return this.http.post<Cliente[]>(this.ruta + '/lista_clientes' + this.random(), { ccod_empresa: this.loginService.codigo_empresa, limite, inicio, filtro, texto, codigoVendedor }).toPromise()
    }

    consultarCliente(codigo_cliente: string) {
        return this.http.post<Cliente>(this.ruta + '/datos_cliente' + this.random(), { ccod_empresa: this.loginService.codigo_empresa, codigo_cliente}).toPromise()
    }

    clienteFormasPago(cod_cliente: string) {
        return this.http.post<FormaPago[]>(this.ruta + '/forma_pagos_cliente' + this.random(),
            { ccod_empresa: this.loginService.codigo_empresa, cod_cliente }
        ).toPromise()
    }

    clienteDirecciones(cod_cliente: string) {
        return this.http.post<Direcciones[]>(this.ruta + '/direcciones_cliente' + this.random(),
            { ccod_empresa: this.loginService.codigo_empresa, cod_cliente }
        ).toPromise()
    }

    clienteAgencias(cod_cliente: string) {
        return this.http.post<Agencias[]>(this.ruta + '/agencias_cliente' + this.random(),
            { ccod_empresa: this.loginService.codigo_empresa, cod_cliente }
        ).toPromise()
    }

    clienteDireccionesAlternativas(cod_cliente: string) {
        return this.http.post<Direcciones[]>(this.ruta + '/direcciones_alternativas_cliente' + this.random(),
            { ccod_empresa: this.loginService.codigo_empresa, cod_cliente }
        ).toPromise()
    }

    listaUbigeo() {
        return this.http.post<Ubigeo[]>(this.rutaApi + '/ubigeo/app/v1/lista' + this.random(), { ccod_empresa: this.loginService.codigo_empresa }).toPromise()
    }

    agregarDireccionAlternativa(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/guardar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
      }
    
      editarDireccionAlternativa(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/modificar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
      }
    
      eliminarDireccionAlternativa(datos: any) {
        datos.codigo_empresa = this.loginService.codigo_empresa
        datos.codigo_usuario = this.loginService.codigo_usuario
        return this.http.post(this.ruta + '/eliminar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
      }

    random() {
        return '/' + new Date().getTime()
    }
}