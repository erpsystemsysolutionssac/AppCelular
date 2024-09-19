import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSelect } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Articulo } from 'src/app/interfaces/interfases';
import { LoginService } from 'src/app/service/login.service';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { ToolsService } from 'src/app/service/tools.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-articulos',
  templateUrl: './lista-articulos.component.html',
  styleUrls: ['./lista-articulos.component.scss'],
})
export class ListaArticulosComponent implements OnInit, OnDestroy {

  private textoBusqueda: string = '';
  public limite = environment.limiteArticulos
  public ionInfi = environment.limiteArticulos
  public inicio = 0
  public arrArticulos: Articulo[] = []
  public estadoRecargar = true;
  public imagenesOpen = false;
  sliederArr: any[] = [];
  private codArticulo: string = '';

  public buscarForm: FormGroup;

  private subscricion: Subscription = null

  public refreshDisabled: boolean = false;
  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('elscroll') elscroll: CdkVirtualScrollViewport;
  @ViewChildren("listaCantidad", { read: ElementRef }) private listaCantidad: QueryList<ElementRef>;

  constructor(
    private form: FormBuilder,
    private toolsService: ToolsService,
    private loginService: LoginService,
    private articuloService: ArticuloService,
    private requerimientoService: RequerimientoService
  ) { }

  async ngOnInit() {

    this.buscarForm = this.form.group({
      buscar: [''],
      filtro: ['Articulos'],
      listaprecios: ['lista_precios_lima']
    });
    let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')

    await this.listaArticulos('')

    setTimeout(() => {
      this.elscroll.scrollToIndex(0.1);
    }, 1);

    this.toolsService.ocultarCargando(idLoading);
  }

  get filtroBuscar() {
    return this.buscarForm.value.filtro
  }

  async refresherArticulos(event) {

    this.arrArticulos = []
    this.limite = environment.limiteArticulos
    this.inicio = 0
    await this.listaArticulos(this.buscarForm.value.buscar)

    event.target.complete();
  }

  async listaArticulos(texto: string) {

    return new Promise((resolve) => {

      this.articuloService.listaArticulosDetalle(this.limite, this.inicio, this.loginService.punto_venta, texto, this.filtroBuscar,  this.buscarForm.value.listaprecios ).subscribe((resp) => {
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

  buscarArticulos(form: FormGroup) {
    let inpBuscar = form.controls.buscar
    if (inpBuscar.pristine) {
      return
    }
    this.arrArticulos = []
    this.inicio = 0
    this.listaArticulos(inpBuscar.value)
  }

  recargarArticulos(event: any) {
    this.inicio = this.inicio + this.limite

    this.listaArticulos(this.textoBusqueda)
      .then(() => {
        event.target.complete();
      })
  }

  cambiarFiltro() {
    this.filtroSelect.open()
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

  agregarProducto(articulo: Articulo, codUnidad: string, factor: number) {

    let objArticulo: Articulo = { ...articulo };
    objArticulo.cunidad = codUnidad;
    objArticulo.factor = factor;

    this.requerimientoService.agregarCarrito(objArticulo)
    this.toolsService.mostrarAlerta(`${objArticulo.nombre} agregado`, 'success', 1000)
  }

  ngOnDestroy(): void {
    console.log('lista articulos destruido');
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }
}
