import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { IonDatetime, IonModal, IonSelect, RefresherCustomEvent, RefresherEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GuiaRemisionCabecera } from 'src/app/interfaces/guia-remision';
import { GuiasRemisionService } from 'src/app/service/guias-remision/guias-remision.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-guias',
  templateUrl: './guias.component.html',
  styleUrls: ['./guias.component.scss'],
})
export class GuiasComponent implements OnInit, OnDestroy {

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('fechaDel') public fechaDel: IonDatetime;
  @ViewChild('fechaHasta') public fechaHasta: IonDatetime;
  @ViewChild('modalDel') modalDel: IonModal;
  @ViewChild('modalHasta') modalHasta: IonModal;

  public arrGuiaCabecera: GuiaRemisionCabecera[] = []

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
    private guiasRemisionService: GuiasRemisionService,
    private toolsS: ToolsService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['NroPedido'],
    })

    this.obtenerPedidos()
    this.subscripcion = this.guiasRemisionService._refresh$.subscribe(() => {
      console.log('refresh')
      this.obtenerPedidos()
    })
  }

  crearRuta() {
    this.guiasRemisionService.rutaClientes.push(...this.arrGuiaCabecera)
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
      let guiaRemisionCabecera = this.arrGuiaCabecera.find((pedido) => {
        return pedido.cnum_doc == doc
      })

      Object.assign(this.guiasRemisionService.guiaRemisionCabecera, guiaRemisionCabecera)
      this.router.navigate(['../guiaRemision/guias', guiaRemisionCabecera.cnum_serie, doc ])

    }
    setTimeout(() => { this.clickCount = 0 }, 300);

  }

  async obtenerPedidos(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsS.mostrarCargando('Cargando Pedidos');
    await this.guiasRemisionService.obtenerPedidos(this.inicio, this.limite, this.filtro, this.campo).then(async (resp) => {

      this.arrGuiaCabecera = []
      for (const pedido1 of resp) {
        for (let [key, value] of Object.entries(pedido1)) {
          if (typeof value == 'string' && value.endsWith('Z') && value.length == 24) {
            pedido1[key] = this.toolsS.parsearMysqlDate(value)
          }
        }
      }
      this.arrGuiaCabecera.push(...resp)

      this.guiasRemisionService.rutaClientes = this.arrGuiaCabecera

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


  ngOnDestroy(): void {
    console.log('destruidoClientes');

    if (!this.subscripcion.closed) {
      this.subscripcion.unsubscribe()
    }
    // this.clienteService._refresh$.unsubscribe()
  }

}
