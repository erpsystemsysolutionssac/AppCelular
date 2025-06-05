import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonDatetime, IonModal, IonSelect } from '@ionic/angular';
import { RequerimientoComponent } from 'src/app/menu/requerimiento/requerimiento.component';
import { EmpleadosService } from 'src/app/service/mantenimiento/empleados.service';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';
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
  private prioridad: string = '';
  arrResponsable: any[] = [];
  responsableSeleccionado: string = '';

  public arrRequerimiento: any[] = [];
  public refreshDisabled: boolean = false;
  public estadoRecargar = true;


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
    private requerimientoService: RequerimientoService,
    private empleadosService: EmpleadosService,
  ) { 
  }

  ngOnInit() {
    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['nroRequerimiento'],
      estado: 'Sin Aprobacion',
      prioridad: ''
    })

    this.listaReqAprobacion01(true);
    this.listarResponsable();
  }

  filtrarRequerimiento() {
    this.inicio = 0;
    this.limite = 100;
    let datos = this.buscarForm.value;
    this.busqueda = datos.filtro
    this.estado = datos.estado;
    this.prioridad = datos.prioridad;
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

    this.listaReqAprobacion01(true);
  }

  async ionRefrescar(e) {
    this.arrRequerimiento = []
    await this.listaReqAprobacion01(true);
    e.target.complete();
    console.log('refresco');
  }

  recargarRequerimientos(event: any) {
    this.inicio = this.inicio + this.limite

    this.listaReqAprobacion01(false)
      .then(() => {
        event.target.complete();
      })
  }

  async listaReqAprobacion01(limpiarArray: boolean, cargar: boolean = true) {
    if (limpiarArray) {
      this.arrRequerimiento = [];
    }

    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Requerimientos');
    await this.requerimientoService.listaReqAprobacion01(this.inicio, this.limite, this.texto, this.fechaInicio, this.fechaFinal, this.estado, this.prioridad, this.busqueda).then(async(resp)=>{
      this.arrRequerimiento.push(...resp) 
      if (cargar) await this.toolsService.ocultarCargando(idLoading)
    }).catch( async (err) => {
      console.log(err);
      if (cargar) await this.toolsService.ocultarCargando(idLoading)
      this.toolsService.mostrarAlerta(err.message, 'error')
    })
  }

  seleccionarCard(arrayRequerimiento, index){
    for (let i = 0; i < arrayRequerimiento.length; i++) {
        const element = arrayRequerimiento[i];
        if (index === i) {
            if (this.arrRequerimiento[i].isSelect) {
                this.arrRequerimiento[i].isSelect = false;
            } else {
                this.arrRequerimiento[i].isSelect = true;
            }
        }
      }
  }

  async actualizarAprobacion(tipoEstado: string){
    let aprobacion = tipoEstado;
    let responsable = this.responsableSeleccionado;
    let comentario = '';
    
    let filas = [];
    this.arrRequerimiento.forEach(element => {
      if (element.isSelect) {
        let fila: any = {};
        fila.Codigo_Punto_Venta = element.Codigo_Punto_Venta; 
        fila.Codigo_Motivo_Serie = element.Codigo_Motivo_Serie; 
        fila.Numero = element.Numero;
        filas.push(fila);
      }
    });
    
    let idLoading: string
    idLoading = await this.toolsService.mostrarCargando('Cargando');
    await this.requerimientoService.actualizarAprobacion(aprobacion, responsable, comentario, filas).then(async(resp: any)=>{

      if (resp.estado) {
        filas.forEach(element => {
          const index = this.arrRequerimiento.findIndex(requerimiento => requerimiento.Numero === element.Numero);
  
          if (index !== -1) {
            this.arrRequerimiento[index].removing = true;
            // setTimeout(() => {
              this.arrRequerimiento.splice(index, 1);
            // }, 500);
          }
        });

        this.toolsService.mostrarAlerta(resp.mensaje+' Documento(s) '+tipoEstado+'(s).', 'success')
      }else{
        this.toolsService.mostrarAlerta(resp.mensaje, 'error')

      }
      
     await this.toolsService.ocultarCargando(idLoading)
    }).catch( async (err) => {
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
            this.arrResponsable = resp;
            this.responsableSeleccionado = this.arrResponsable[0].Codigo;
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }
}
