import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Articulo } from 'src/app/interfaces/interfases';
import { Promociones, PromocionDetalle } from 'src/app/interfaces/promociones';
import { environment } from 'src/environments/environment';
import { LoginService } from '../login.service';
import { ToolsService } from '../tools.service';
import { CarritoService } from './carrito.service';

@Injectable({
  providedIn: 'root'
})
export class PromocionesService {

  private ruta = this.toolsService.obtenerUrl('url') +'/promociones'
  public subject = new Subject<any>();

  constructor(
    private loginS:LoginService,
    private http:HttpClient,
    private carritoS:CarritoService,
    private toolsService: ToolsService
    ) { }

  
  refrescar(){
    this.subject.next()
  }

  obtenerPromociones(){
    let codigo_empresa = this.loginS.codigo_empresa
    let punto_venta = this.loginS.punto_venta
    return this.http.post<Promociones[]>(this.ruta+'/obtener_promociones',{codigo_empresa,punto_venta}).toPromise()
  }

  obtenerArticulosPromo(limite:number,inicio:number,texto:string,filtro:string,codFiltro:any[]){
    let tipo:string ;
    let codLista:string; 
    if(Object.keys(this.carritoS.objCliente).length==0){
      tipo = '12'
      codLista = '01'
    }else{
      tipo = this.carritoS.objCliente.cgrupo_cliente
      codLista = this.carritoS.objCliente.lista_precios
    }    
    let punto_venta =  this.loginS.punto_venta
    let codigo_empresa = this.loginS.codigo_empresa
    return this.http
    .post<Articulo[]>(this.ruta+'/obtener_articulos_promo',
    {codigo_empresa,tipo,codLista,punto_venta,limite,inicio,texto,filtro,codFiltro}
    ).toPromise()
  }
}
