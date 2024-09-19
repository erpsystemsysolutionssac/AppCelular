import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { LoginService } from 'src/app/service/login.service';
import { ToolsService } from 'src/app/service/tools.service';
import { Articulo, dataBonificado, filtroListaPrecio, Moneda } from 'src/app/interfaces/interfases';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { Subscription } from 'rxjs';
import { IonModal, IonSelect, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import SwiperCore, { SwiperOptions, Navigation, Pagination, A11y, Swiper, Zoom } from 'swiper';
SwiperCore.use([Navigation, Pagination, A11y, Zoom]);

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { KeyValue } from '@angular/common';
import { ModalPromocionesComponent } from '../modal-promociones/modal-promociones.component';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.scss'],
})
export class ArticulosComponent implements OnInit, OnDestroy {
  public listaPrecioCliente: string = '';
  @ViewChild('elscroll') elscroll: CdkVirtualScrollViewport;

  @ViewChild('cropperModal') cropperModal: IonModal;
  @ViewChild('cropper') cropper: ImageCropperComponent;
  public imgCropear: any;
  public croppedImage: any = '';
  public cropperLoading: boolean = true;
  private textoBusqueda: string = '';

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    // loop:true,
    pagination: { clickable: true, },
    autoHeight: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    zoom: { maxRatio: 10 }
  };

  sliederArr: any[] = []
  imagenCambiar: any
  imagenNombre: string

  @ViewChildren("listaCantidad", { read: ElementRef }) private listaCantidad: QueryList<ElementRef>;
  @ViewChildren("listaDescuento", { read: ElementRef }) private listaDescuento: QueryList<ElementRef>;

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('listapreciosSelect') listapreciosSelect: IonSelect;

  public codigo_empresa: string;
  public limite = environment.limiteArticulos
  public ionInfi = environment.limiteArticulos
  public inicio = 0
  public arrArticulos: Articulo[] = []
  public arrfiltroListaPrecio: filtroListaPrecio[] = []

  public arrPrueba: any[] = [{ msg: '1' }]
  public arrPrueba2: any[] = [{ msg: '2' }]

  public estadoRecargar = true
  public imagenesOpen = false

  public buscarForm: FormGroup;

  private codArticulo: string = ''

  private subscricion: Subscription = null

  public refreshDisabled: boolean = false
  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }

  public keepOriginalOrder = (a, b) => a.key

  constructor(
    private toolsService: ToolsService,
    private loginService: LoginService,
    private articuloService: ArticuloService,
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalCtrl: ModalController,
  ) {
    console.log('ArticulosComponent')
   }

  async ngOnInit() {

    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['Articulos'],
      listaprecios: ['lista_precios_lima']
    });
    let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')

    var lstaprecios_calcular = this.buscarForm.value.listaprecios
    this.arrfiltroListaPrecio = []
    this.arrfiltroListaPrecio.push(lstaprecios_calcular)
    this.carritoService.agregarfiltroListaPrecio(this.arrfiltroListaPrecio[0])

    await this.listaArcticulos('')

    setTimeout(() => {
      this.elscroll.scrollToIndex(0.1);
    }, 1);

    this.toolsService.ocultarCargando(idLoading);

    this.articuloService.eventSeleccionArticulo.subscribe(async data => {

      if (data && this.listaPrecioCliente != await this.articuloService.getListaPrecioCliente()) {
        let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')
        this.arrArticulos = []
    
        const res = await this.listaArcticulos('');
        if (res == 'acabo') {
          this.toolsService.ocultarCargando(idLoading)
        } else {
          this.toolsService.ocultarCargando(idLoading)
        }
        ;
      }
    });
  }

  get filtroBuscar() {
    return this.buscarForm.value.filtro
  }

  async refresherArticulos(event) {

    this.arrArticulos = []
    this.limite = environment.limiteArticulos
    this.inicio = 0
    await this.listaArcticulos(this.buscarForm.value.buscar)

    event.target.complete();
  }

  async listaArcticulos(texto: string) {

    this.listaPrecioCliente = await this.articuloService.getListaPrecioCliente();
    return new Promise((resolve) => {

      this.articuloService.listaArticulosDetalle(this.limite, this.inicio, this.loginService.punto_venta, texto, this.filtroBuscar, this.listaPrecioCliente == "" ? this.buscarForm.value.listaprecios : this.listaPrecioCliente)
        .subscribe((resp) => {
          if (resp.length < this.ionInfi) {
            this.estadoRecargar = false
          } else {
            this.estadoRecargar = true
          }

          this.arrArticulos.push(...resp)

          resolve('acabo')
        }, (err) => {
          console.log(err);
        })
    })
  }


  recargarArticulos(event: any) {
    this.inicio = this.inicio + this.limite
    this.listaArcticulos(this.textoBusqueda)
      .then(() => {
        event.target.complete();
      })
  }

  //#region Imagenes

  abrirImagenesModal(articulo: Articulo) {
    this.imagenesOpen = true

    this.sliederArr = []
    this.codArticulo = articulo.codigo

    let ind = 1
    for (let [key, value] of Object.entries(articulo)) {
      if (key.includes('imagen')) {

        if (value == null) value = ''
        this.sliederArr.push({ nro: ind, src: value, change: false, blob: null, name: '', borrar: false, namePrev: value })
        ind++
      }
    }
  }


  cerrarImagenesModal() {
    this.imagenesOpen = false
  }
  modalImgSeCerro() {
    this.imagenesOpen = false
  }
  // cerrarPromocionesModal(){
  //   this.promocionesOpen=false
  // }
  // modalPromocionesSeCerro(){
  //   this.promocionesOpen=false
  // }


  onSwiper(swiper: Swiper) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  onSlideChange([swiper]) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }

  async cambiarGaleria() {
    const image = await Camera.getPhoto({
      quality: 25,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Escoger de la Galeria',
      promptLabelPicture: 'Tomar Foto',
      promptLabelHeader: 'Foto',
    });
    await this.cropperModal.present()
    let imageUrl = image.webPath;
    this.imagenNombre = new Date().getTime() + '.' + image.format
    this.imgCropear = imageUrl
    this.cropperLoading = true
  }

  async borrarImagen() {
    if (this.imagenCambiar.src == '') {
      return
    }
    let borrar: boolean
    await this.toolsService.confirmarAlerta('Se borrara la imagen', 'warning').then((resp) => {
      borrar = resp
    })
    if (borrar) {
      this.imagenCambiar.src = ''
      this.imagenCambiar.blob = null
      this.imagenCambiar.change = false
      this.imagenCambiar.borrar = true
    }
  }

  imageLoaded() {
    this.cropperLoading = false
  }

  loadImageFailed() {
    console.log('loadImageFailed');
  }

  async generarCropper() {
    this.cropperModal.dismiss()
    const response = await fetch(this.cropper.crop().base64);
    const blob = await response.blob();
    this.imagenCambiar.src = this.sanitizer.bypassSecurityTrustUrl(response.url)
    this.imagenCambiar.name = this.imagenNombre
    this.imagenCambiar.change = true
    this.imagenCambiar.blob = blob
    this.imagenCambiar.borrar = false

    this.imgCropear = ''
  }

  async cancel() {
    this.cropperLoading = true
    this.imgCropear = ''
    await this.cropperModal.dismiss();
  }

  async guardarImagen() {
    let idLoading = await this.toolsService.mostrarCargando()

    await this.subirImagenes().then(async (resp) => {

      await this.toolsService.ocultarCargando(idLoading)
      this.articuloService.refrescar()
      this.toolsService.mostrarAlerta('Foto Editada')
      this.imagenesOpen = false
    })

  }

  subirImagenes() {
    const formImagenes: FormData = new FormData();
    let arrBorrar: any[] = []
    let cambiarImg: boolean = false
    let arrOrden: any[] = []
    let arrNombrePrev: any[] = []

    for (const imagen of this.sliederArr) {
      if (imagen.change) {
        cambiarImg = true
        formImagenes.append('imagenes', imagen.blob, imagen.name);
        arrNombrePrev.push(imagen.namePrev)
        arrOrden.push(imagen.nro)

      }
      if (imagen.borrar) {
        cambiarImg = true
        arrBorrar.push({ name: imagen.name, ordenBor: imagen.nro, namePrev: imagen.namePrev })
      }
    }
    if (arrOrden.length > 0) {
      formImagenes.append('ordenSub', JSON.stringify(arrOrden));
      formImagenes.append('namePrev', JSON.stringify(arrNombrePrev));
    }

    if (arrBorrar.length > 0) {
      formImagenes.append('borrar', JSON.stringify(arrBorrar));
    }
    if (cambiarImg) {
      formImagenes.append('ccod_articulo', this.codArticulo);
      return this.articuloService.cambiarImagen(formImagenes, this.toolsService.fechaYHora())
    }
    else {
      return new Promise((resolve) => { resolve('todo ok') })
    }
  }

  //#endregion

  verArticulo(ccod_articulo: string) {
    this.articuloService.datosArticulo = this.arrArticulos.find((articulo) => {
      return articulo.codigo == ccod_articulo
    })
    this.router.navigate(['catalogo/articulos', ccod_articulo])
  }

  buscarArticulos(form: FormGroup) {
    let inpBuscar = form.controls.buscar
    if (inpBuscar.pristine) {
      return
    }
    this.arrArticulos = []
    this.inicio = 0
    this.textoBusqueda = inpBuscar.value
    this.listaArcticulos(inpBuscar.value)
  }

  async buscarArticulosKey(event) {
    this.arrArticulos = []
    this.inicio = 0
    this.textoBusqueda = event.target.value;

    var texto = event.target.value;
    return new Promise((resolve) => {
      this.articuloService.listaArticulosDetalle(this.limite, this.inicio, this.loginService.punto_venta, texto, this.filtroBuscar, this.buscarForm.value.listaprecios)
        .subscribe((resp) => {
          if (resp.length < this.ionInfi) {
            this.estadoRecargar = false
          } else {
            this.estadoRecargar = true
          }
          this.arrArticulos = []
          this.arrArticulos.push(...resp)

          resolve('acabo')
        }, (err) => {
          console.log(err);
        })
    })
  }

  cambiarFiltro() {
    this.filtroSelect.open()
  }
  cambiarListaPrecio() {
    this.listapreciosSelect.open()
  }
  async actualizarListaPrecio() {
    let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')
    this.arrArticulos = []
    var lstaprecios_calcular = this.buscarForm.value.listaprecios
    this.arrfiltroListaPrecio = []
    this.arrfiltroListaPrecio.push(lstaprecios_calcular)
    this.carritoService.agregarfiltroListaPrecio(this.arrfiltroListaPrecio[0])
    this.carritoService.arrCarrito.splice(0, this.carritoService.arrCarrito.length)
    this.listaArcticulos("")
    this.toolsService.ocultarCargando(idLoading)
  }
  sumarCantidad(cod: any) {
    let value: number
    let articulo = this.listaCantidad.find((item) => {
      return item.nativeElement.id == cod
    })

    let articu = this.arrArticulos.find((articulo) => {
      return articulo.codigo == cod
    })
    value = articulo.nativeElement.value
    value++
    articu.cantidad = value
    articulo.nativeElement.value = value
  }

  restarCantidad(cod: any) {
    let value: number
    let articulo = this.listaCantidad.find((item) => {
      return item.nativeElement.id == cod
    })
    let articu = this.arrArticulos.find((articulo) => {
      return articulo.codigo == cod
    })
    value = articulo.nativeElement.value
    if (value == 1) return
    value--
    articu.cantidad = value
    articulo.nativeElement.value = value
  }

  valorInput(event: any, cod: string) {
    let inputValor = parseInt(event.detail.value)

    if (isNaN(inputValor) || inputValor <= 0) {
      inputValor = 1
    }
    let articu = this.arrArticulos.find((articulo) => {

      return articulo.codigo == cod
    })

    articu.cantidad = inputValor

    this.calcularValores(cod, articu);

  }

  valorDescuento(event: any, cod: string) {
    let inputValor = parseFloat(event.detail.value);

    if (isNaN(inputValor) || inputValor <= 0) {
      inputValor = 0
    }

    let articu = this.arrArticulos.find((articulo) => {
      return articulo.codigo == cod
    })

    if (articu.verificar_descuentos == "S") {
      if (inputValor > articu.descuento_maximo) {
        inputValor = articu.descuento_maximo
        let descuento_input = this.listaDescuento.find((item) => {
          return item.nativeElement.id == cod
        })
        descuento_input.nativeElement.value = inputValor
      }
    }
    articu.descuento = inputValor

    this.calcularValores(cod, articu);
  }

  calcularValores(cod: string, articu: Articulo) {

    var lstaprecios_calcular = this.buscarForm.value.listaprecios
    var buscar_descuentos = true;
    articu.listaPrecios.forEach((lista) => {
      lista.precioOriginal = lista.precioLista;
      var porc_descuento = 0;
      var monto_descuento = 0;

      for (let i = 0; i < articu.listaDescuentos.length; i++) {
        const element = articu.listaDescuentos[i];
        if (element.codigo == lista.codigo && element.unidad == lista.unidad) {
          if (articu.cantidad >= element.minimo && articu.cantidad <= element.maximo) {
            if (articu.descuento_monto_porcentaje == "P") {
              porc_descuento = element.descuento / 100
              monto_descuento = lista.precioLista * porc_descuento;
              
            } else {
              porc_descuento = element.descuento
              monto_descuento = porc_descuento
            }
            lista.precioOriginal = lista.precioLista;
            lista.otroDesc = element.descuento;
            break;
          }else{
            lista.otroDesc = 0;
          }
        }
      }


      if (lstaprecios_calcular == "lista_precios_provincia") {
        articu.listaPreciosRango.forEach(element => {
          if (element.codigo == lista.codigo && element.unidad == lista.unidad) {
            if (articu.cantidad >= element.minimo && articu.cantidad <= element.maximo) {
              
              lista.precioOriginal = element.precioOriginal;
            }
          }
        });
      }
      if (articu.descuento > 0) {
        if (articu.descuento_monto_porcentaje == "P") {
          lista.monto = this.toolsService.redondear(lista.precioOriginal) * articu.cantidad * ((100 - articu.descuento) / 100)
        } else {
          lista.monto = (this.toolsService.redondear(lista.precioOriginal) * articu.cantidad) - articu.descuento
        }

      } else {
        lista.monto = this.toolsService.redondear(lista.precioOriginal) * articu.cantidad
      }
      if (porc_descuento > 0) {
        if (articu.descuento_monto_porcentaje == "P") {
          lista.monto = lista.monto - (lista.monto * porc_descuento)
        } else {
          lista.monto = lista.monto - porc_descuento
        }
      }

      if (this.carritoService.masIgv == 'S') {
        lista.montoMasIgv = lista.monto * (1 + (articu.nigv/100));
      }else{
        lista.montoMasIgv = lista.monto;
      }

      articu.descuentoPromo = articu.descuento

    })
  }

  async agregarCarrito(articulo: Articulo, index: number) {

    if (articulo.check_bonificacion == undefined) {
      articulo.check_bonificacion = false;
    }
    let listaEscojida = articulo.listaPrecios.find((lista, i) => {
      return i == index
    })
    let objArticulo: Articulo = { ...articulo };

    if (this.carritoService.masIgv == 'S') {
      listaEscojida.montoMasIgv = listaEscojida.monto * (1 + (articulo.nigv/100));
    }else{
      listaEscojida.montoMasIgv = listaEscojida.monto;
    }
    
    if (listaEscojida.otroDesc) {
      objArticulo.descuento = listaEscojida.otroDesc;
      objArticulo.descuentoPromo = listaEscojida.otroDesc;
    } 

    objArticulo.listaPrecios = [{ ...listaEscojida }];

    
    this.carritoService.agregarCarrito(objArticulo)
    this.toolsService.mostrarAlerta(`${objArticulo.nombre} agregado al Carrito`, 'success', 1000)
    
    await this.buscarBonificaciones(objArticulo);
  }

  valorPromocion(event: any, indexArray: number) {

    let precioBase = 0;
    let total_importe = 0;
    let montoDesc_original = 0;
    let total_importe_con_descuentos = 0;
    this.arrArticulos.find((articulo, i) => {

      if (i == indexArray) {

        for (let k = 0; k < articulo.listaPrecios.length; k++) {

          if ((event.detail).checked) {
            if (articulo.descuento_monto_porcentaje == "P") {
              articulo.descuentoPromo = 100
            } else {
              articulo.descuentoPromo = articulo.listaPrecios[k].precioOriginal * articulo.cantidad;
            }
            articulo.check_bonificacion = true;
          } else {
            articulo.descuentoPromo = articulo.descuento;
            articulo.check_bonificacion = false;
          }

          if (articulo.moneda == '$') {
            precioBase = this.toolsService.redondear(articulo.listaPrecios[k].precioOriginal * this.carritoService.tipoCambioVenta)
            total_importe = this.toolsService.redondear(precioBase * articulo.cantidad)
          } else {
            precioBase = articulo.listaPrecios[k].precioOriginal
            total_importe = this.toolsService.redondear(precioBase * articulo.cantidad)
          }

          if (articulo.descuentoPromo != undefined && articulo.descuentoPromo > 0) {

            if (articulo.descuento_monto_porcentaje == "P") {
              montoDesc_original = this.toolsService.redondear(total_importe * (articulo.descuentoPromo / 100))
            } else {
              montoDesc_original = articulo.descuentoPromo
            }

          }

          total_importe_con_descuentos = total_importe - montoDesc_original;

          articulo.listaPrecios[k].monto = total_importe_con_descuentos;
          articulo.listaPrecios[k].montoMasIgv = total_importe_con_descuentos;
        }

        // if (this.carritoService.masIgv == 'S') {
        //   articulo.listaPrecios[0].montoMasIgv = articulo.listaPrecios[0].monto * (1 + (articulo.nigv/100));
        // }else{
        //   articulo.listaPrecios[0].montoMasIgv = articulo.listaPrecios[0].monto;
        // }
        
        
      }
    })

  }

  async mostrarModalPromociones(documento: any){
    const modal = await this.modalCtrl.create({
      component: ModalPromocionesComponent,
      componentProps: {
          documento: documento
      }
  });

  await modal.present();
  }

  async buscarBonificaciones(dataArticulo: Articulo){
   
    let dataBonificado: dataBonificado = {
      codigo_articulo: dataArticulo.codigo,
      fecha: this.loginService.datosUsu.fecha_trabajo_sistema,
      listaPrecio: dataArticulo.listaPrecios[0].codigoLista,
      monedaDocumento: dataArticulo.moneda,
      tipoCambio: this.carritoService.tipoCambioVenta,
      puntoVenta: this.loginService.punto_venta,
      cantidad_articulo: dataArticulo.cantidad
    }
    let objArticuloBonificado: Articulo = {}

    await this.articuloService.articuloBonificado(dataBonificado).then((resp) => {
      console.log(resp);
      if (resp.length > 0) {
        for (let i = 0; i < resp.length; i++) {
          objArticuloBonificado = {}
          const element = resp[i];
      
          objArticuloBonificado.check_bonificacion = true;
          objArticuloBonificado.codigo = element.codigo;
          objArticuloBonificado.cantidad = element.cantidad;
          objArticuloBonificado.cunidad = element.unidad;
          objArticuloBonificado.nombre = element.nombre;
          objArticuloBonificado.precio = element.Unit;
          objArticuloBonificado.moneda = Moneda.S;
          objArticuloBonificado.nigv = element.Igv_Art;
          objArticuloBonificado.descuentoPromo = 100;
          objArticuloBonificado.descuento_monto_porcentaje = "P";
          objArticuloBonificado.imagen_1 = element.imagen_1;

          objArticuloBonificado.listaPrecios = [{
            codigoLista: dataBonificado.listaPrecio,
            codigo: element.codigo,
            montoMasIgv: 0,
            monto: 0,
            precioLista: element.Unit,
            precioOriginal: element.Unit, 
            unidad: element.unidad,
            factor: element.factor
          }]; 
          objArticuloBonificado.listaDescuentos = [];
          objArticuloBonificado.listaPreciosRango = [];
          
          this.carritoService.agregarCarrito(objArticuloBonificado)
          
        }
        this.toolsService.mostrarAlerta(`Productos bonificados agregados al Carrito`, 'success', 1000)
      }
    }).catch( (err) => {
      console.log(err)
    })

  }

  ngOnDestroy(): void {
    console.log('articulos destruido');
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }

}