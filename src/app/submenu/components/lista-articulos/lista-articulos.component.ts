import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonSelect } from '@ionic/core/components';
import { Articulo } from 'src/app/interfaces/articulo';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { LoginService } from 'src/app/service/login.service';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { ToolsService } from 'src/app/service/tools.service';
import { environment } from 'src/environments/environment';
import { ModalImagenesArticuloComponent } from '../modal-imagenes-articulo/modal-imagenes-articulo.component';
import { ModalPromocionesComponent } from '../modal-promociones/modal-promociones.component';
import { Subscription } from 'rxjs';
import { DocumentosPendientesComponent } from '../documentos-pendientes/documentos-pendientes.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-lista-articulos',
  templateUrl: './lista-articulos.component.html',
  styleUrls: ['./lista-articulos.component.scss'],
})
export class ListaArticulosComponent implements OnInit {
  public formulario: FormGroup;

  public listaArticulos: Articulo[] = [];

  public listaPrecioCliente: string = '';

  public limite = environment.limiteArticulos;
  public ionInfi = environment.limiteArticulos;
  public inicio = 0;
  public estadoRecargar = true;
  public refreshDisabled: boolean = false;
  private textoBusqueda: string = '';

  private subscricion: Subscription = null;
  public modulo: string;

  constructor(
    private form: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toolsService: ToolsService,
    private productoService: ProductoService,
    private loginService: LoginService,
    private modalCtrl: ModalController,
    private carritoService: CarritoService
  ) { }

  @ViewChild('elScroll') elScroll: CdkVirtualScrollViewport;
  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('listapreciosSelect') listapreciosSelect: IonSelect;

  async ngOnInit() {
    this.modulo = localStorage.getItem('modulo');

    this.formulario = this.form.group({
      buscar: [''],
      filtro: ['Articulos'],
      listaprecios: ['lista_precios_lima']
    });

    let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')

    // var lstaprecios_calcular = this.formulario.value.listaprecios
    // this.arrfiltroListaPrecio = []
    // this.arrfiltroListaPrecio.push(lstaprecios_calcular)
    // this.carritoService.agregarfiltroListaPrecio(this.arrfiltroListaPrecio[0])

    await this.consultarArticulos('')

    setTimeout(() => {
      this.elScroll.scrollToIndex(0.1);
    }, 1);

    this.toolsService.ocultarCargando(idLoading);

    this.productoService.eventSeleccionArticulo.subscribe(async data => {
      console.log(data, this.listaPrecioCliente, await this.productoService.getListaPrecioCliente())
      if (data && this.listaPrecioCliente != await this.productoService.getListaPrecioCliente()) {
        let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')
        this.listaArticulos = []
    
        const res = await this.consultarArticulos('');
        if (res == 'acabo') {
          this.toolsService.ocultarCargando(idLoading)
        } else {
          this.toolsService.ocultarCargando(idLoading)
        }
        ;
      }
    });

  }

  buscarArticulos(form: FormGroup) {
    let inpBuscar = form.controls.buscar
    if (inpBuscar.pristine) {
      return
    }
    this.listaArticulos = []
    this.inicio = 0
    this.textoBusqueda = inpBuscar.value
    this.consultarArticulos(inpBuscar.value)
  }

  async refresherArticulos(event) {

    this.listaArticulos = [];
    this.limite = environment.limiteArticulos;
    this.inicio = 0;
    await this.consultarArticulos(this.formulario.value.buscar)

    event.target.complete();
  }

  async consultarArticulos(texto: string) {

    this.listaPrecioCliente = await this.productoService.getListaPrecioCliente();
    console.log(this.listaPrecioCliente, this.formulario.value.listaprecios);
    return new Promise((resolve) => {

      this.productoService.listaArticulosDetalle(this.limite, this.inicio, this.loginService.punto_venta, texto, this.filtroBuscar, this.listaPrecioCliente == "" ? this.formulario.value.listaprecios : this.listaPrecioCliente)
        .subscribe((resp) => {
          if (resp.length < this.ionInfi) {
            this.estadoRecargar = false
          } else {
            this.estadoRecargar = true
          }

          this.listaArticulos.push(...resp)

          resolve('acabo')
        }, (err) => {
          console.log(err);
        })
    })
  }

  recargarArticulos(event: any) {
    this.inicio = this.inicio + this.limite
    this.consultarArticulos(this.textoBusqueda)
      .then(() => {
        event.target.complete();
      })
  }

  sumarCantidad(articulo: Articulo) {
    articulo.cantidad += 1;
  }

  restarCantidad(articulo: Articulo) {
    if(articulo.cantidad > 0)
    articulo.cantidad -= 1;
  }

  valorInput(articulo: Articulo) {
    if (isNaN(articulo.cantidad) || articulo.cantidad <= 0) {
      articulo.cantidad = 1;
    }

    this.calcularValores(articulo.codigo, articulo);
  }

  valorDescuento(articulo: Articulo) {

    if (isNaN(articulo.descuento) || articulo.descuento <= 0) {
      articulo.descuento = 0
    }

    if (articulo.verificar_descuentos == "S") {
      if (articulo.descuento > articulo.descuento_maximo) {
        articulo.descuento = articulo.descuento_maximo

      }
    }

    this.calcularValores(articulo.codigo, articulo);
  }

  valorPromocion(event: any, articulo: Articulo) {
    articulo.check_bonificacion = (event.detail).checked;
  }

  calcularValores(codigoArticulo: string, articulo: Articulo) {

    const lstaprecios_calcular = this.formulario.value.listaprecios

    articulo.listaPrecios.forEach((lista) => {
      lista.precioOriginal = lista.precioLista;
      var porc_descuento = 0;
      var monto_descuento = 0;

      for (let i = 0; i < articulo.listaDescuentos.length; i++) {
        const element = articulo.listaDescuentos[i];
        if (element.codigo == lista.codigo && element.unidad == lista.unidad) {
          if (articulo.cantidad >= element.minimo && articulo.cantidad <= element.maximo) {
            if (articulo.descuento_monto_porcentaje == "P") {
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
        if (articulo.estado_rango == '1') {
          articulo.listaPreciosRango.forEach(element => {
            if (element.codigo == lista.codigo && element.unidad == lista.unidad) {
              if (articulo.cantidad >= element.minimo && articulo.cantidad <= element.maximo) {
                lista.precioOriginal = element.precioOriginal;
              }
            }
          });
        }
      }
      // console.log(lista.precioOriginal);
 
      if (articulo.descuento > 0) {
        if (articulo.descuento_monto_porcentaje == "P") {
          lista.monto = this.toolsService.redondear(lista.precioOriginal) * articulo.cantidad * ((100 - articulo.descuento) / 100)
        } else {
          lista.monto = (this.toolsService.redondear(lista.precioOriginal) * articulo.cantidad) - articulo.descuento
        }
      } else {
        lista.monto = this.toolsService.redondear(lista.precioOriginal) * articulo.cantidad
      }

      if (porc_descuento > 0) {
        if (articulo.descuento_monto_porcentaje == "P") {
          lista.monto = lista.monto - (lista.monto * porc_descuento)
        } else {
          lista.monto = lista.monto - porc_descuento
        }
      }

      articulo.descuentoPromo = articulo.descuento

      // CONFIGURACION PARA VISUALIZAR EL PRECIO DEL PRODUCTO MAS IGV SEGUN LA CONFIGURACION VISTA PRECIO APP MOVIL
      if (articulo.tipo_vista_precio_producto == 'MASIGV') {
        if (articulo.mas_igv_precio_producto == 'S') {
          lista.monto = lista.monto * 1.18;
        }
      }
    })

  }

  async agregarCarrito(articulo: Articulo, index: any) {
    console.log(articulo, index);
    const lstaprecios_calcular = this.formulario.value.listaprecios

    if (articulo.check_bonificacion == undefined) {
      articulo.check_bonificacion = false;
    }

    let data: DetalleVenta = {Cantidad: 0, Codigo: '', Nombre: '', Codigo_Unidad: '', Unidad: '', Comision_porcentaje: 0, Factor: 0, Unit: 0, Desc1: 0, Desc2: 0, Desc3: 0, Desc4: 0, Igv_Art: 0, Perpecion_porc: 0, imagen_1: '', moneda: '', tipo_descuento: 'P', check_bonificacion: false};

    data.Cantidad = articulo.cantidad;
    data.Codigo = articulo.codigo;
    data.Nombre = articulo.nombre;
    data.Codigo_Unidad = index.unidad;
    data.Unidad = index.unidad;
    data.Factor = index.factor;

    data.Unit = index.precioLista;

    if (lstaprecios_calcular == "lista_precios_provincia") {
      if (articulo.estado_rango == '1') {
        articulo.listaPreciosRango.forEach(element => {
          if (element.codigo == index.codigo && element.unidad == index.unidad) {
            if (articulo.cantidad >= element.minimo && articulo.cantidad <= element.maximo) {
              data.Unit = element.precioOriginal;
            }
          }
        });
      } 
    }

    data.Desc1 = 0;
    data.Desc2 = articulo.check_bonificacion == true ? 100 : articulo.descuento || 0;
    data.Desc3 = index.otroDesc || 0;
    data.Igv_Art = articulo.nigv;
    data.Peso = articulo.peso;
    data.imagen_1 = articulo.imagen_1;
    data.moneda = articulo.moneda;
    data.tipo_descuento = articulo.descuento_monto_porcentaje;
    data.check_bonificacion = articulo.check_bonificacion;
    data.Precio_original = index.precioLista;

    data.articulo = articulo;
    console.log(data);

    this.carritoService.agregarCarritov2(data);
    this.toolsService.mostrarAlerta(`${articulo.nombre} agregado al Carrito`, 'success', 1000)
    
    // await this.buscarBonificaciones(objArticulo);
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
   
    // let dataBonificado: dataBonificado = {
    //   codigo_articulo: dataArticulo.codigo,
    //   fecha: this.loginService.datosUsu.fecha_trabajo_sistema,
    //   listaPrecio: dataArticulo.listaPrecios[0].codigoLista,
    //   monedaDocumento: dataArticulo.moneda,
    //   tipoCambio: this.carritoService.tipoCambioVenta,
    //   puntoVenta: this.loginService.punto_venta,
    //   cantidad_articulo: dataArticulo.cantidad
    // }
    // let objArticuloBonificado: Articulo = {}

    // await this.articuloService.articuloBonificado(dataBonificado).then((resp) => {
    //   console.log(resp);
    //   if (resp.length > 0) {
    //     for (let i = 0; i < resp.length; i++) {
    //       objArticuloBonificado = {}
    //       const element = resp[i];
      
    //       objArticuloBonificado.check_bonificacion = true;
    //       objArticuloBonificado.codigo = element.codigo;
    //       objArticuloBonificado.cantidad = element.cantidad;
    //       objArticuloBonificado.cunidad = element.unidad;
    //       objArticuloBonificado.nombre = element.nombre;
    //       objArticuloBonificado.precio = element.Unit;
    //       objArticuloBonificado.moneda = Moneda.S;
    //       objArticuloBonificado.nigv = element.Igv_Art;
    //       objArticuloBonificado.descuentoPromo = 100;
    //       objArticuloBonificado.descuento_monto_porcentaje = "P";
    //       objArticuloBonificado.imagen_1 = element.imagen_1;

    //       objArticuloBonificado.listaPrecios = [{
    //         codigoLista: dataBonificado.listaPrecio,
    //         codigo: element.codigo,
    //         montoMasIgv: 0,
    //         monto: 0,
    //         precioLista: element.Unit,
    //         precioOriginal: element.Unit, 
    //         unidad: element.unidad,
    //         factor: element.factor
    //       }]; 
    //       objArticuloBonificado.listaDescuentos = [];
    //       objArticuloBonificado.listaPreciosRango = [];
          
    //       this.carritoService.agregarCarrito(objArticuloBonificado)
          
    //     }
    //     this.toolsService.mostrarAlerta(`Productos bonificados agregados al Carrito`, 'success', 1000)
    //   }
    // }).catch( (err) => {
    //   console.log(err)
    // })
  }

  async mostrarModalDocumentosPendientes(tipoDocmuento: string) {
    const modal = await this.modalCtrl.create({
      component: DocumentosPendientesComponent,
      componentProps: {
        tipoDocumento: tipoDocmuento
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if(data){
      this.carritoService.documentoPendienteSeleccionado = data; 
      this.router.navigate(['../carrito'], { relativeTo: this.route })
    }
  }

  cambiarFiltro() {
    this.filtroSelect.open()
  }

  cambiarListaPrecio() {
    this.listapreciosSelect.open()
  }

  async actualizarListaPrecio() {
    let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')
    this.listaArticulos = []
    // var lstaprecios_calcular = this.formulario.value.listaprecios
    // this.arrfiltroListaPrecio = []
    // this.arrfiltroListaPrecio.push(lstaprecios_calcular)
    // this.carritoService.agregarfiltroListaPrecio(this.arrfiltroListaPrecio[0])
    // this.carritoService.arrCarrito.splice(0, this.carritoService.arrCarrito.length)
    this.consultarArticulos("")
    this.toolsService.ocultarCargando(idLoading)
  }

  async abrirImagenesModal(articulo: Articulo) {
    const modal = await this.modalCtrl.create({
      component: ModalImagenesArticuloComponent,
      componentProps: {
        data: articulo
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data.actualizar) {
      let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos');
      this.listaArticulos = []
      this.consultarArticulos('');
      this.toolsService.ocultarCargando(idLoading)
    }
  }

  get filtroBuscar() {
    return this.formulario.value.filtro
  }

  ngOnDestroy(): void {
    console.log('articulos destruido');
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }

  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }
}
