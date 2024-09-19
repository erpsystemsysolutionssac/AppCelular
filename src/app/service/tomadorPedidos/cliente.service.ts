import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Cliente, FormaPago, Ubigeo, Direcciones, Agencias } from 'src/app/interfaces/interfases';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public clientesOn = false
  public clienteCarrito = []

  private ruta = this.toolsService.obtenerUrl('url') + '/clientes'
  private rutaApi = this.toolsService.obtenerUrl('urlApi');

  public _refresh$ = new Subject<any>()

  constructor(private http: HttpClient,
    private loginsService: LoginService,
    private toolsService: ToolsService
  ) { }

  refresh() {
    this._refresh$.next()
  }

  random() {
    return '/' + new Date().getTime()
  }

  listarClientes(limite: number, inicio: number, filtro: string, texto: string) {
    return this.http.post<Cliente[]>(this.ruta + '/lista_clientes' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa, limite, inicio, filtro, texto }).toPromise()
  }

  listarTipoDocumento() {
    return this.http.post(this.ruta + '/lista_documentos' + this.random(), {}).toPromise()
  }

  listarGrupoClientes() {
    return this.http.post<any[]>(this.ruta + '/grupo_clientes' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa }).toPromise()
  }

  verificarDocumento(tip_doc: string, ndoc_id: string) {
    return this.http.post(this.ruta + '/verificar_docu' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa, tip_doc, ndoc_id }).toPromise()
  }

  consultarDocumento(cod: string | number, tp: string) {
    return this.http.post(this.ruta + '/consultar_docu' + this.random(), { cod, tp }).toPromise()
  }

  listaPais() {
    return this.http.post<Ubigeo[]>(this.ruta + '/paises' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa }).toPromise()
  }

  listaDepartamento() {
    return this.http.post<Ubigeo[]>(this.ruta + '/lista_departamento' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa }).toPromise()

  }
  listaCiudad(cod: string) {
    return this.http.post<Ubigeo[]>(this.ruta + '/lista_ciudad' + this.random(), { cod }).toPromise()
  }
  listaDistrito(cod: string) {
    return this.http.post<Ubigeo[]>(this.ruta + '/lista_distrito' + this.random(), { cod }).toPromise()
  }

  listaUbigeo() {
    return this.http.post<Ubigeo[]>(this.rutaApi + '/ubigeo/app/v1/lista' + this.random(), {}).toPromise()

  }

  listaZona01() {
    return this.http.post<any[]>(this.ruta + '/lista_zona01' + this.random(), { ccod_empresa: this.loginsService.codigo_empresa }).toPromise()
  }

  agregarCliente(datos: any) {
    datos.codigo_empresa = this.loginsService.codigo_empresa
    datos.codigo_usuario = this.loginsService.codigo_usuario
    return this.http.post(this.ruta + '/guardar_cliente' + this.random(), { ...datos }).toPromise()
  }

  clienteFormasPago(cod_cliente: string) {
    return this.http.post<FormaPago[]>(this.ruta + '/forma_pagos_cliente' + this.random(),
      { ccod_empresa: this.loginsService.codigo_empresa, cod_cliente }
    ).toPromise()
  }

  clienteDirecciones(cod_cliente: string) {
    return this.http.post<Direcciones[]>(this.ruta + '/direcciones_cliente' + this.random(),
      { ccod_empresa: this.loginsService.codigo_empresa, cod_cliente }
    ).toPromise()
  }

  clienteDireccionesAlternativas(cod_cliente: string) {
    return this.http.post<Direcciones[]>(this.ruta + '/direcciones_alternativas_cliente' + this.random(),
      { ccod_empresa: this.loginsService.codigo_empresa, cod_cliente }
    ).toPromise()
  }

  clienteAgencias(cod_cliente: string) {
    return this.http.post<Agencias[]>(this.ruta + '/agencias_cliente' + this.random(),
      { ccod_empresa: this.loginsService.codigo_empresa, cod_cliente }
    ).toPromise()
  }

  obtenerCliente(ccod_cliente: string) {
    return this.http.post<Cliente[]>(this.ruta + '/obtener_cliente', { ccod_empresa: this.loginsService.codigo_empresa, ccod_cliente }).toPromise()
  }

  editarCliente(cliente: Cliente) {
    return this.http.post<any>(this.ruta + '/editar_cliente', { cod_usuario: this.loginsService.codigo_usuario, ccod_empresa: this.loginsService.codigo_empresa, ...cliente }).toPromise()

  }

  editarClienteCords(cod: string, cords: any, fecha: string, verificar: boolean) {
    return this.http.post<any>(this.ruta + '/editar_cordenadas',
      {
        ccod_empresa: this.loginsService.codigo_empresa, cod,
        ...cords,
        usuario: this.loginsService.codigo_usuario, fecha, verificar
      }).toPromise()
  }

  editarClienteImagenes(imagenes: FormData, fecha: string) {
    imagenes.append('ccod_empresa', this.loginsService.codigo_empresa)
    imagenes.append('usuario', this.loginsService.codigo_usuario)
    imagenes.append('fecha', fecha)

    return this.http.post<any>(this.ruta + '/editar_imagenes', imagenes).toPromise()
  }

  agregarDireccionAlternativa(datos: any) {
    datos.codigo_empresa = this.loginsService.codigo_empresa
    datos.codigo_usuario = this.loginsService.codigo_usuario
    return this.http.post(this.ruta + '/guardar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
  }

  editarDireccionAlternativa(datos: any) {
    datos.codigo_empresa = this.loginsService.codigo_empresa
    datos.codigo_usuario = this.loginsService.codigo_usuario
    return this.http.post(this.ruta + '/modificar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
  }

  eliminarDireccionAlternativa(datos: any) {
    datos.codigo_empresa = this.loginsService.codigo_empresa
    datos.codigo_usuario = this.loginsService.codigo_usuario
    return this.http.post(this.ruta + '/eliminar_direccion_alternativa' + this.random(), { ...datos }).toPromise()
  }

}
