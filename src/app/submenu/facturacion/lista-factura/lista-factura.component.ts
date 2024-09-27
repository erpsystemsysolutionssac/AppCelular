import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { IonDatetime, IonModal, IonSelect, RefresherCustomEvent, RefresherEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FacturaCabecera } from 'src/app/interfaces/factura';
import { FacturacionService } from 'src/app/service/facturacion/facturacion.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-lista-factura',
  templateUrl: './lista-factura.component.html',
  styleUrls: ['./lista-factura.component.scss'],
})
export class ListaFacturaComponent implements OnInit, OnDestroy {

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('fechaDel') public fechaDel: IonDatetime;
  @ViewChild('fechaHasta') public fechaHasta: IonDatetime;
  @ViewChild('modalDel') modalDel: IonModal;
  @ViewChild('modalHasta') modalHasta: IonModal;

  public arrFacturaCabecera: FacturaCabecera[] = []

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
    private facturacionService: FacturacionService,
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

    this.obtenerFacturas()
    this.subscripcion = this.facturacionService._refresh$.subscribe(() => {
      console.log('refresh')
      this.obtenerFacturas()
    })
  }

  crearRuta() {
    this.facturacionService.rutaClientes.push(...this.arrFacturaCabecera)
    this.router.navigate(['../verMas', new Date().getTime()], { relativeTo: this.route })
  }

  async ionRefrescar(e) {
    await this.obtenerFacturas(false);
    e.target.complete();
    console.log('refresco');
  }

  clickRow(i: number, doc: string) {

    if (i != this.filaClick) this.clickCount = 0

    this.filaClick = i
    this.clickCount++

    if (this.clickCount == 2) {
      let facturaCabecera = this.arrFacturaCabecera.find((pedido) => {
        return pedido.cnum_doc == doc
      })

      Object.assign(this.facturacionService.facturaCabecera, facturaCabecera)
      this.router.navigate(['../facturacion/factura', facturaCabecera.cnum_serie, doc ])

    }
    setTimeout(() => { this.clickCount = 0 }, 300);

  }

  async obtenerFacturas(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsS.mostrarCargando('Cargando Facturas');
    await this.facturacionService.obtenerFacturas(this.inicio, this.limite, this.filtro, this.campo).then(async (resp) => {

      this.arrFacturaCabecera = []
      for (const pedido1 of resp) {
        for (let [key, value] of Object.entries(pedido1)) {
          if (typeof value == 'string' && value.endsWith('Z') && value.length == 24) {
            pedido1[key] = this.toolsS.parsearMysqlDate(value)
          }
        }
      }
      this.arrFacturaCabecera.push(...resp)

      this.facturacionService.rutaClientes = this.arrFacturaCabecera

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
    this.obtenerFacturas()
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
