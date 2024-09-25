import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Vendedor } from '../interfaces/interfases';
import { ToolsService } from './tools.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public modulo: string = '';

  public datosUsu:any
  public centro_costo:any
  public unidad_negocio:any
  public codigo_empresa:any
  public codigo_empresa_contratante:any
  public codigo_usuario:any
  public ruc_empresa_contratante:any
  public ruc_empresa_usuario:any
  public punto_venta:any
  public ccod_almacen:any
  public cdireccion:string
  public ctelefono:string
  public cpag_web:string
  public crazonsocial:string
  public cemail:string
  public permisosUsu:any ={}

  public objVendedor:Vendedor ={}

  public logeado = false;

  private customHeaders = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http:HttpClient,
    private toolsService: ToolsService
  ) { }

  random(){
    return new Date().getTime().toString().slice(6,20)
  }

  asingarVariables (){
    for (const [key,value] of Object.entries(this.datosUsu.permisos)){
      if (value == 'si' || value =='no') this.permisosUsu[key] = value;
    }
    this.centro_costo = this.datosUsu.centro_costos
    this.unidad_negocio =this.datosUsu.unidad_negocio
    this.codigo_empresa=this.datosUsu.codigo_empresa
    this.codigo_empresa_contratante=this.datosUsu.codigo_empresa_contratante
    this.codigo_usuario=this.datosUsu.codigo_usuario
    this.ruc_empresa_contratante=this.datosUsu.ruc_empresa_contratante
    this.ruc_empresa_usuario=this.datosUsu.ruc_empresa_usuario
    this.punto_venta=this.datosUsu.punto_venta
    this.ccod_almacen=this.datosUsu.ccod_almacen
    this.cdireccion =this.datosUsu.cdireccion
    this.ctelefono=this.datosUsu.ctelefono
    this.cpag_web=this.datosUsu.cpag_web
    this.crazonsocial=this.datosUsu.crazonsocial
    this.cemail=this.datosUsu.cemail
    Object.assign(this.objVendedor,this.datosUsu.vendedor)
  }

  verificarRuc(rucInicio:String){
    return this.http.post<any>(this.toolsService.obtenerUrl('url')+ '/auth'+'/verificar_ruc',{ruc:rucInicio}, this.customHeaders).toPromise()
  }

  listaEmpresas (ruc:String){
    return this.http.post<any[]>(this.toolsService.obtenerUrl('url')+ '/auth'+'/lista_empresas',{ruc})
  }

  listaPuntoVenta (codigo:String){
    return this.http.post<any[]>(this.toolsService.obtenerUrl('url')+ '/auth'+'/lista_pto_venta',{codigo})
  }

  listaUnidadNegocio (codigo:String){
    return this.http.post<any[]>(this.toolsService.obtenerUrl('url')+ '/auth'+'/lista_und_negocio',{codigo})
  }

  listaCentroCosto(codigo:String){
    return this.http.post<any[]>(this.toolsService.obtenerUrl('url')+ '/auth'+'/lista_ctro_costos',{codigo})
  }

  obtenerPermisos(erp_codemp:string,erp_coduser:string){
    return this.http.post<any>(this.toolsService.obtenerUrl('url')+ '/auth'+'/obtener_permisos',{erp_codemp,erp_coduser}).toPromise()
  }

  logear(datos:any){ 
    return this.http.post<any>(this.toolsService.obtenerUrl('url')+ '/auth'+'/login',{...datos}).toPromise()
  }

  loginERP(datos:any){ 
  
    let body = {
      fecha_ingreso: '2024-05-09',
      hora_ingreso: '17:04:38 PM',
      usuario: datos.usuario,
      clave: datos.password,
      ruc: '20600124782',
      ruc_empresa: '20600124782',
      codigo_empresa: datos.codigo_empresa, 
      codigo_punto_venta: datos.ptoVenta, 
      codigo_centro_costos: datos.ctrCostos,
      nombre_centro_costos: 'datosdatos',
      codigo_unidad_negocio: datos.undNegocio,
      nombre_unidad_negocio: 'datosdatos',
      sistema: 'APP'
    };

    return this.http.post<any>(this.toolsService.obtenerUrl('urlApi')+'/ingresarApp/'+ this.calcularNumeroRandomUrl(),{...body}).toPromise()
  }

  async obtenerVendedor(){

    return this.http.post<any>(this.toolsService.obtenerUrl('url')+ '/auth'+'/obtener_vendedor',{
      codigo_empresa:this.datosUsu.codigo_empresa,
      codigo_usuario:this.datosUsu.codigo_usuario,
    }).toPromise().then((resp)=>{
      this.datosUsu.vendedor = resp
    })
  }


  guardarLogueo(){

    let datos =JSON.stringify( {
      ...this.datosUsu,
      activo:true}
    )
    this.logeado=true
    localStorage.setItem('login',datos)
  }


  refrescarVendedor(values:any){
    let datos = JSON.parse(localStorage.getItem('login'))
    datos.vendedor.celular=values.celular
    datos.vendedor.cnom_vendedor=values.nombre
    datos.vendedor.email=values.correo
    datos.vendedor.telefono1=values.telefono   
    Object.assign(this.objVendedor,datos.vendedor)
    localStorage.setItem('login',JSON.stringify({...datos,activo:true}))
    return datos
  }


  verificarLogueo(){
    let datos = localStorage.getItem('login')
    this.datosUsu=JSON.parse(datos)
    if (this.datosUsu == null) {
      this.logeado = false
      return {activo:false}
    } else{

    this.logeado = true
    this.asingarVariables()    
    return JSON.parse(datos)
    }   
  }

  cerrarSesion(){
    localStorage.removeItem('login')
    this.logeado=false

  }


  calcularNumeroRandomUrl() {
    var random = Math.floor((Math.random() * (1000 - 1 + 1)) + 1);
    var milliseconds = new Date().getMilliseconds()
    var numero_adicional = random + '-' + milliseconds
    return numero_adicional;
  }

  updateModulo(_modulo: string){
    localStorage.setItem('modulo', _modulo);
  }

  getModulo(){
    return localStorage.getItem('modulo')
  }
}
