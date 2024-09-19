import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild, Renderer2, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IonDatetime, IonModal, IonSelect } from '@ionic/angular';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-lista-requerimientos',
  templateUrl: './lista-requerimientos.component.html',
  styleUrls: ['./lista-requerimientos.component.scss'],
})
export class ListaRequerimientosComponent implements OnInit {

  public buscarForm: FormGroup;
  public fechasOn: boolean = false;
  private inicio: number = 0
  private limite: number = 100
  private busqueda: string = 'todos'
  private fechaInicio: string = '';
  private fechaFinal: string = '';
  private texto: string = '';
  private filtro: string[] = ['']

  public arrRequerimiento: any[] = [];
  public refreshDisabled: boolean = false;
  public estadoRecargar = true;

  @ViewChild('filtroSelect') filtroSelect: IonSelect;
  @ViewChild('fechaDel') public fechaDel: IonDatetime;
  @ViewChild('fechaHasta') public fechaHasta: IonDatetime;
  @ViewChild('modalDel') modalDel: IonModal;
  @ViewChild('modalHasta') modalHasta: IonModal;
  @ViewChild('elscroll') elscroll: CdkVirtualScrollViewport;

  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private toolsService: ToolsService,
    private requerimientoService: RequerimientoService
  ) {
    this.cargarScripts01()
   }

  ngOnInit() {
    this.buscarForm = this.fb.group({
      buscar: [''],
      filtro: ['nroRequerimiento'],
    })

    this.listaRequerimientos();

    setTimeout(() => {
      this.elscroll.scrollToIndex(0.1);
    }, 1);
  }

  filtrarRequerimiento() {
    let datos = this.buscarForm.value
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
    this.listaRequerimientos();
  }

  async ionRefrescar(e) {
    this.arrRequerimiento = []
    await this.listaRequerimientos(false);
    e.target.complete();
    console.log('refresco');
  }

  recargarRequerimientos(event: any) {
    this.inicio = this.inicio + this.limite

    this.listaRequerimientos()
      .then(() => {
        event.target.complete();
      })
  }

  async listaRequerimientos(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Requerimientos');
    await this.requerimientoService.listaRequerimientos(this.inicio, this.limite, this.texto, this.fechaInicio, this.fechaFinal, this.busqueda).then(async(resp)=>{
     
      this.arrRequerimiento.push(...resp) 
      if (cargar) await this.toolsService.ocultarCargando(idLoading)
    })
  }

  dbClickRow(i: number, doc: string){    

    let requerimiento = this.arrRequerimiento.find((requerimiento)=>{
      return requerimiento.Numero == doc
    })

    this.requerimientoService.reqSeleccionado = requerimiento; 
    this.router.navigate(['../requerimiento/verRequerimiento', doc])
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

  async cargarScripts01(){
    const urls = [
      { url: 'https://code.jquery.com/jquery-3.7.1.js', ejecutar: false },
      { url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js', ejecutar: false },
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

}
