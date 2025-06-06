import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { IonDatetime, IonModal, IonSelect, RefresherCustomEvent, RefresherEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PedidoCabecera } from 'src/app/interfaces/pedidoCabecera';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('fechaDel') public fechaDel: IonDatetime;
  @ViewChild('fechaHasta') public fechaHasta: IonDatetime;
  @ViewChild('modalDel') modalDel: IonModal;
  @ViewChild('modalHasta') modalHasta: IonModal;

  public arrPedidosC: PedidoCabecera[] = []

  private inicio: number = 0
  private limite: number = 100
  private filtro: string[] = ['']
  private campo: string = ''

  private subscripcion: Subscription

  public buscarForm: FormGroup

  public filaClick = 0
  public clickCount = 0
  public fechasOn: boolean = false

  /*
    Filtrar por estado Cliente fecha y por nro pedido
   */
  constructor(
    private pedidoS: PedidosService,
    private renderer: Renderer2,
    private toolsS: ToolsService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.cargarScripts01()
  }

  ngOnInit() {
    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['NroPedido'],
    })

    this.obtenerPedidos()
    this.subscripcion = this.pedidoS._refresh$.subscribe(() => {
      console.log('refresh')
      this.obtenerPedidos()
    })
  }

  crearRuta() {
    this.pedidoS.rutaClientes.push(...this.arrPedidosC)
    this.router.navigate(['../verMas', new Date().getTime()], { relativeTo: this.route })
  }

  async ionRefrescar(e) {
    await this.obtenerPedidos(false);
    e.target.complete();
    console.log('refresco');
  }

  clickRow(i: number, doc: string) {

    if (i != this.filaClick) this.clickCount = 0

    this.filaClick = i
    this.clickCount++

    if (this.clickCount == 2) {
      let pedicoC = this.arrPedidosC.find((pedido) => {
        return pedido.cnum_doc == doc
      })

      Object.assign(this.pedidoS.pedidoCabecera, pedicoC)
      console.log(pedicoC);
      this.router.navigate(['../tomadorPedidos/pedidos', pedicoC.ccod_almacen, pedicoC.idmotivo_venta, doc])

    }
    setTimeout(() => { this.clickCount = 0 }, 300);

  }

  async obtenerPedidos(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsS.mostrarCargando('Cargando Pedidos');
    await this.pedidoS.obtenerPedidos(this.inicio, this.limite, this.filtro, this.campo).then(async (resp) => {

      this.arrPedidosC = []
      for (const pedido1 of resp) {
        for (let [key, value] of Object.entries(pedido1)) {
          if (typeof value == 'string' && value.endsWith('Z') && value.length == 24) {
            pedido1[key] = this.toolsS.parsearMysqlDate(value)
          }
        }
      }
      this.arrPedidosC.push(...resp)

      this.pedidoS.rutaClientes = this.arrPedidosC

      if (cargar) await this.toolsS.ocultarCargando(idLoading)
    })
  }

  filtrarPedido() {
    let datos = this.buscarForm.value
    this.campo = datos.filtro
    this.filtro = []

    switch (datos.filtro) {
      case 'Fecha':
        let f1 = this.toolsS.parsearIso(this.fechaDel.value.toString(), false)
        let f2 = this.toolsS.parsearIso(this.fechaHasta.value.toString(), false)
        this.filtro.push(f1, f2)
        break;
      default:
        this.filtro.push(datos.buscar)
        break;
    }
    this.obtenerPedidos()
  }

  selectCambio() {
    let filtro: string = this.filtroSelect.value

    if (filtro == 'Fecha') {
      this.fechasOn = true
      this.fechaDel.value = this.toolsS.fechaYHoraIso()
      this.fechaHasta.value = this.toolsS.fechaYHoraIso()
    }
    else this.fechasOn = false
  }

  cambiarFiltro() {
    this.filtroSelect.open()
  }

  mostrarMdDel() {
    this.modalDel.present()
  }
  cerrarMdDe() {
    this.modalDel.dismiss()
  }

  mostrarMdHasta() {
    this.modalHasta.present()
  }
  cerrarMdHasta() {
    this.modalHasta.dismiss()
  }

  async cargarScripts01(){
    const urls = [
      // { url: 'https://code.jquery.com/jquery-3.7.1.js', ejecutar: false },
      // { url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/plugins/globalize.js', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/js/utilitarios/otros.js', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/js/utilitarios/calculos.js', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/js/utilitarios/jquerytemplates.js', ejecutar: false }
    ]

    const promises = urls.map(({url, ejecutar}) => this.loadScript(url, ejecutar));
    await Promise.all(promises)
  }

  async loadScript(scriptUrl: string, ejecutar: boolean){
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');

      this.renderer.setAttribute(script, 'src', scriptUrl);
      this.renderer.appendChild(document.body, script);
    });
  }

  ngOnDestroy(): void {
    console.log('destruidoClientes');

    if (!this.subscripcion.closed) {
      this.subscripcion.unsubscribe()
    }
    // this.clienteService._refresh$.unsubscribe()
  }

}
