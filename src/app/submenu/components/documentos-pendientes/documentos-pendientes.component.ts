import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime, IonModal, IonSelect, ModalController } from '@ionic/angular';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-documentos-pendientes',
  templateUrl: './documentos-pendientes.component.html',
  styleUrls: ['./documentos-pendientes.component.scss'],
})
export class DocumentosPendientesComponent implements OnInit {
  public buscarForm: FormGroup;
  public tituloVentana: string;

  public fechasOn: boolean = false;
  private inicio: number = 0
  private limite: number = 50
  private busqueda: string = 'todos'
  private filtro: string[] = ['']
  private fechaInicio: string = '';
  private fechaFinal: string = '';
  private texto: string = '';

  public arrDocumentosPendientes: any[] = [];
  public refreshDisabled: boolean = false;
  public estadoRecargar = true;

  private modulo: string;

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
    private modalCtrl: ModalController,
    private toolsService: ToolsService,
    private pedidosService: PedidosService
  ) { }

  ngOnInit() {
    this.modulo = localStorage.getItem('modulo')

    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['nroPedido']
    })

    this.listaDocmuentosPendientes(true);
  }

  async ionRefrescar(e) {
    this.arrDocumentosPendientes = []
    await this.listaDocmuentosPendientes(true);
    e.target.complete();
    console.log('refresco');
  }

  recargarDocumentosPendientes(event: any) {
    this.inicio = this.inicio + this.limite

    this.listaDocmuentosPendientes(false)
      .then(() => {
        event.target.complete();
      })
  }

  filtraDocumentosPendientes(){
    this.inicio = 0;
    this.limite = 50;
    let datos = this.buscarForm.value;
    this.busqueda = datos.filtro
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

    this.listaDocmuentosPendientes(true);
  }

  async listaDocmuentosPendientes(limpiarArray: boolean, cargar: boolean = true) {
    if (limpiarArray) {
      this.arrDocumentosPendientes = [];
    }
    
    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Documentos Pendientes');

    switch (this.modulo) {
      case 'guiaRemision':
        this.tituloVentana = 'Pedidos Pendientes'
        await this.pedidosService.listaPedidosPendientes(this.inicio, this.limite, this.texto, this.fechaInicio, this.fechaFinal, this.busqueda).then(async(resp)=>{
     
          this.arrDocumentosPendientes.push(...resp) 
          if (cargar) await this.toolsService.ocultarCargando(idLoading)

        });
        break;
    
      default:
        break;
    }
    
  }

  selectCambio() {
    let filtro: string = this.filtroSelect.value
    console.log(this.toolsService.fechaYHoraIso())
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

  clickRow(data: any){
    this.modalCtrl.dismiss(data);
  }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
