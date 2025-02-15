import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime, IonModal, IonSelect } from '@ionic/angular';
import { EmpleadosService } from 'src/app/service/mantenimiento/empleados.service';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-lista-aprobacion',
  templateUrl: './lista-aprobacion.component.html',
  styleUrls: ['./lista-aprobacion.component.scss'],
})
export class ListaAprobacionComponent implements OnInit {

  public buscarForm: FormGroup;
  public fechasOn: boolean = false;
  private inicio: number = 0
  private limite: number = 100
  private busqueda: string = 'todos'
  private filtro: string[] = ['']
  private fechaInicio: string = '';
  private fechaFinal: string = '';
  private texto: string = '';
  estado: string = 'Sin Aprobacion';

  public arrPedido: any[] = [];
  public refreshDisabled: boolean = false;
  public estadoRecargar = true;
  private responsableSeleccionado: string = ''


  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('fechaDel') public fechaDel: IonDatetime;
  @ViewChild('fechaHasta') public fechaHasta: IonDatetime;
  @ViewChild('modalDel') modalDel: IonModal;
  @ViewChild('modalHasta') modalHasta: IonModal;

  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private pedidosService: PedidosService,
    private empleadosService: EmpleadosService
  ) {
  }

  ngOnInit() {
    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['nroPedido'],
      estado: 'Sin Aprobacion',
    })

    this.listaPedAprobacion(true);
    this.listarResponsable();
  }

  filtrarPedido() {
    this.inicio = 0;
    this.limite = 100;
    let datos = this.buscarForm.value;
    this.busqueda = datos.filtro
    this.estado = datos.estado;
    this.filtro = []

    switch (datos.filtro) {
      case 'rango_fechas':
        this.fechaInicio = this.toolsService.parsearIso(this.fechaDel.value.toString(), false)
        this.fechaFinal = this.toolsService.parsearIso(this.fechaHasta.value.toString(), false)
        break;
      default:
        this.texto = datos.buscar;
        break;
    }

    this.listaPedAprobacion(true);
  }

  async ionRefrescar(e) {
    this.arrPedido = []
    await this.listaPedAprobacion(true);
    e.target.complete();
    console.log('refresco');
  }

  recargarRequerimientos(event: any) {
    this.inicio = this.inicio + this.limite

    this.listaPedAprobacion(false)
      .then(() => {
        event.target.complete();
      })
  }

  async listaPedAprobacion(limpiarArray: boolean, cargar: boolean = true) {
    if (limpiarArray) {
      this.arrPedido = [];
    }

    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Requerimientos');
    await this.pedidosService.listaPedAprobacion(this.inicio, this.limite, this.texto, this.fechaInicio, this.fechaFinal, this.estado, this.busqueda).then(async (resp) => {
      this.arrPedido.push(...resp)
      if (cargar) await this.toolsService.ocultarCargando(idLoading)
    }).catch(async (err) => {
      console.log(err);
      if (cargar) await this.toolsService.ocultarCargando(idLoading)
      this.toolsService.mostrarAlerta(err.message, 'error')
    })
  }

  seleccionarCard(arraPedido, index) {
    for (let i = 0; i < arraPedido.length; i++) {
      const element = arraPedido[i];
      if (index === i) {
        if (this.arrPedido[i].isSelect) {
          this.arrPedido[i].isSelect = false;
        } else {
          this.arrPedido[i].isSelect = true;
        }
      }
    }
  }

  async actualizarAprobacion(tipoEstado: string) {
    let aprobacion = tipoEstado;
    let responsable = this.responsableSeleccionado;
    let comentario = '';

    let filas = [];
    this.arrPedido.forEach(element => {
      if (element.isSelect) {
        let fila: any = {};
        fila.Codigo_Punto_Venta = element.Codigo_Punto_Venta;
        fila.Codigo_Motivo_Serie = element.Codigo_Motivo_Serie;
        fila.Numero = element.Numero;
        filas.push(fila);
      }
    });

    let idLoading: string;
    idLoading = await this.toolsService.mostrarCargando('Cargando');
    await this.pedidosService.actualizarAprobacion(aprobacion, responsable, comentario, filas).then(async (resp: any) => {

      if (resp.estado) {
        filas.forEach(element => {
          const index = this.arrPedido.findIndex(pedido => pedido.Numero === element.Numero);

          if (index !== -1) {
            this.arrPedido[index].removing = true;
            this.arrPedido.splice(index, 1);
          }
        });

        this.toolsService.mostrarAlerta(resp.mensaje + ' Documento(s) ' + tipoEstado + '(s).', 'success')
      }

      await this.toolsService.ocultarCargando(idLoading)
    }).catch(async (err) => {
      console.log(err);
      await this.toolsService.ocultarCargando(idLoading)
      this.toolsService.mostrarAlerta(err.message, 'error')
    })
  }

  selectCambio() {
    let filtro: string = this.filtroSelect.value

    if (filtro == 'rango_fechas') {
      this.fechasOn = true
      this.fechaDel.value = this.toolsService.fechaYHoraIso()
      this.fechaHasta.value = this.toolsService.fechaYHoraIso()
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

  async listarResponsable() {
    return new Promise((resolve) => {
      this.empleadosService.listaResponsable().subscribe((resp) => {
            if (resp.length == 0) {
              this.responsableSeleccionado = '00';
            }
            this.responsableSeleccionado = resp[0].Codigo;
            console.log(this.responsableSeleccionado)
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }
}
