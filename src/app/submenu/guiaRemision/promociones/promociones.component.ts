import { Component, ElementRef, OnInit,OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonInfiniteScroll, IonModal } from '@ionic/angular';
import { IonChip } from '@ionic/core/components';
import { Subscription } from 'rxjs';
import { Articulo } from 'src/app/interfaces/interfases';
import { Promociones, PromocionDetalle } from 'src/app/interfaces/promociones';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { PromocionesService } from 'src/app/service/tomadorPedidos/promociones.service';
import { ToolsService } from 'src/app/service/tools.service';
import { environment } from 'src/environments/environment';

import SwiperCore,{ SwiperOptions,Navigation, Pagination,A11y, Swiper,Zoom } from 'swiper';
SwiperCore.use([Navigation, Pagination, A11y,Zoom]);

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.scss'],
})
export class PromocionesComponent implements OnInit,OnDestroy {
 
  public arrPromo:Promociones[]=[]
  public arrPromoDetalle:PromocionDetalle[]=[]
  public arrArticulos :Articulo[] =[]

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    // loop:true,
    pagination: { clickable: true, },
    autoHeight:true,
    centeredSlides:true,
    centeredSlidesBounds:true,
    zoom:{maxRatio:10}
  };
  private limite:number =environment.limitePromocioes
  private inicio:number =0
  private ionInfi =environment.limitePromocioes
  private texto:string=''
  private filtrarDb:boolean= true
  private arrFiltro:Articulo[]=[]
  private tabDiferente:boolean = true
  public estadoRecargar=false
  private relistarDatos:any
  private relistarFiltro:any


  @ViewChildren("listaCantidad", {read: ElementRef}) private listaCantidad: QueryList<ElementRef>;
  @ViewChild("modalImg") private modalImg: IonModal;
  @ViewChild("recargar") private ionRecargar: IonInfiniteScroll;

  sliederArr:any[] =[]
  private subscricion:Subscription = null

  public buscarForm:FormGroup

  constructor(
    private promoS:PromocionesService,
    private toolsS:ToolsService,
    private carritoS:CarritoService,
    private fb:FormBuilder
    ) { }

  async ngOnInit() {
    this.buscarForm = this.fb.group({buscar:['',[]]})
    let idLoading:string
    idLoading = await this.toolsS.mostrarCargando('Buscando Promociones')
    await this.obtenerPromociones()
    await this.toolsS.ocultarCargando(idLoading)

    this.subscricion = this.promoS.subject.subscribe(()=>{
      console.log('refrescar promos');
      this.obtenerArticuloPromo(this.relistarFiltro,this.relistarDatos,true)
    })
  }

  buscarArticulos = (form:FormGroup)=>{
    this.texto = form.value.buscar
    this.arrArticulos =this.arrFiltro
    this.arrArticulos= this.arrArticulos.filter((articulo)=>{
      return articulo.nombre.toUpperCase().includes(this.texto.toUpperCase())
    })
  }
  tabPromocion(tabPromo:Promociones){    
    for (const pro of this.arrPromo) pro.activo = true
    tabPromo.activo=false
    for (const pro of this.arrPromoDetalle) pro.activo = true
    this.arrPromoDetalle=[]
    if (tabPromo.tipo_promocion !='articulo') this.arrPromoDetalle.push(...tabPromo.promocionDetalle)
    else{
      this.texto = ''
      this.obtenerArticuloPromo(tabPromo.tipo_promocion,tabPromo.promocionDetalle,true)
    }
  }

  tabPromocionDetalle(tabPromo:PromocionDetalle){
    let filtro =this.arrPromo.find((pr)=>pr.activo==false)
    for (const pro of this.arrPromoDetalle) pro.activo = true
    tabPromo.activo=false
    this.texto = ''

    this.obtenerArticuloPromo(filtro.tipo_promocion,[tabPromo.codigo_articulo,tabPromo.descuento],true)
  }

  async obtenerPromociones(){
    await this.promoS.obtenerPromociones().then((resp)=>{      
      for (const promo of resp) {
        for (let [key,value] of Object.entries(promo)) {
          if (typeof value == 'string' && value.endsWith('Z') && value.length == 24) {
            promo[key]= this.toolsS.parsearMysqlDate(value)
          }
        }
      }
      this.arrPromo = resp
    })
    .catch((err)=>{
      console.log(err);
      this.toolsS.mostrarAlerta('error','error')
    })
  }

  async obtenerArticuloPromo(filtro:string='',codFiltro:any[] =[],limpiar:boolean=false){  
    
    let idLoading:string
    idLoading =  await this.toolsS.mostrarCargando('Cargando Articulos')
    
    await this.promoS.obtenerArticulosPromo(this.limite,this.inicio,this.texto,filtro,codFiltro)
    .then(async(resp)=>{

      this.arrFiltro= resp

      if (this.arrArticulos.length == this.ionInfi) {
        this.filtrarDb=true
      }

      this.relistarDatos = codFiltro
      this.relistarFiltro=filtro
      if (limpiar) this.arrArticulos = [];

      this.arrArticulos.push(...resp)      

      for (const articulo of this.arrArticulos) {
        this.aplicarDescuento(articulo)
      }
      await this.toolsS.ocultarCargando(idLoading)
    })
    .catch(async(err)=>{
      console.log(err);
      await this.toolsS.ocultarCargando(idLoading)
      await this.toolsS.mostrarAlerta('error','error')
    })

  
  }

  async recargarArticulos(event:any){
    this.inicio = this.inicio +this.limite
    await this.obtenerArticuloPromo(this.relistarFiltro,this.relistarDatos,false).then()  
    await event.target.complete();

  }

  aplicarDescuento(articulo:Articulo){
    for (const lista of articulo.listaPrecios) {
      lista.monto =this.toolsS.redondear(lista.precioOriginal * (1-(articulo.descuentoPromo/100))) 
      lista.montoMasIgv = 258;
    }
  }

  sumarCantidad(cod:any){
    let value:number
    let articulo =  this.listaCantidad.find((item)=>{
      return item.nativeElement.id ==cod
    })

    let articu =   this.arrArticulos.find((articulo)=>{
      return articulo.codigo == cod
    })
    value =articulo.nativeElement.value
    value++
    articu.cantidad = value
    articulo.nativeElement.value =value
  }

  restarCantidad(cod:any){
    let value:number
    let articulo =  this.listaCantidad.find((item)=>{
      return item.nativeElement.id ==cod
    })
    let articu =   this.arrArticulos.find((articulo)=>{
      return articulo.codigo == cod
    })
    value =articulo.nativeElement.value
    if (value == 1) return
    value--
    articu.cantidad = value
    articulo.nativeElement.value =value
  }

  valorInput(event:any,cod:string){
    let inputValor = parseInt(event.detail.value)
    
    if (isNaN(inputValor) || inputValor <= 0) {
      inputValor = 1
    }
    let articu =   this.arrArticulos.find((articulo)=>{
      return articulo.codigo == cod
    })
  
    if (inputValor>articu.Stock) {
      inputValor =articu.Stock
    }

    articu.cantidad = inputValor
    articu.listaPrecios.forEach((precio)=>{
      precio.monto =this.toolsS.redondear(precio.precioOriginal) *articu.cantidad
      precio.monto = this.toolsS.redondear(precio.monto* (1-(articu.descuentoPromo/100)))
      // precio.montoMasIgv = 25; //Agregado para pruebas
    })
  }
  //#region imagenes
  async abrirImagenesModal(articulo:Articulo){
    this.sliederArr = []    
    await this.modalImg.present()
    let ind =1
    for (let [key, value] of Object.entries(articulo)) {
      if (key.includes('imagen')) {

        if(value == null) value=''
        this.sliederArr.push({nro:ind,src:value,change:false,blob:null,name:'',borrar:false,namePrev:value})
        ind++
      }
    }
  }
  async cerrarModal(){
    await this.modalImg.dismiss()
  }

  //#endregion

  agregarCarrito (articulo:Articulo,index:number){
    let listaEscojida = articulo.listaPrecios.find((lista,i)=>{
      return  i == index
    })
    let objArticulo:Articulo = {...articulo};    
    objArticulo.listaPrecios = [{...listaEscojida}]    
    this.carritoS.agregarCarrito(objArticulo)
    this.toolsS.mostrarAlerta(`${objArticulo.nombre} agregado al Carrito`,'success',1000)

    // this.carritoService.arrCarrito.push(objArticulo)
  }

  ngOnDestroy():void{
    console.log('promos destroy');
    if ( !this.subscricion.closed) {
      this.subscricion.unsubscribe()
    }
  }

}
