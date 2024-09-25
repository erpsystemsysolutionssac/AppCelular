import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSelect } from '@ionic/angular';
import { ListaPrecioRango } from 'src/app/interfaces/listaPrecio';
import { AlmacenService } from 'src/app/service/mantenimiento/almacen.service';
import { ListaPreciosService } from 'src/app/service/mantenimiento/lista-precios.service';
import { PuntoVentaService } from 'src/app/service/mantenimiento/punto-venta.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-lista-precios',
  templateUrl: './lista-precios.component.html',
  styleUrls: ['./lista-precios.component.scss'],
})
export class ListaPreciosComponent implements OnInit {

  @ViewChild('elscroll') elscroll: CdkVirtualScrollViewport;

  public listaPrecios: ListaPrecioRango[] = []
  public arrPuntoVenta: any[] = []
  public arrAlmacen: any[] = []
  public buscarForm: FormGroup;

  public ionInfi = 50;
  public inicio = 0;
  public limite = 50;
  public estadoRecargar = true;

  public refreshDisabled: boolean = false
  @HostListener("window:scroll") onWindowScroll(event) {
    const top = event.srcElement.scrollTop
    if (top == 0) this.refreshDisabled = false
    else this.refreshDisabled = true
  }

  constructor(
    // private listaPreciosS: ListaPreciosService, 
    private fb: FormBuilder, 
    private toolsService: ToolsService,
    private almacenService: AlmacenService,
    private puntoVentaService: PuntoVentaService,
    private listaPreciosService: ListaPreciosService
  ) { }

  async ngOnInit() {
    
    this.buscarForm = this.fb.group({
      buscar: [''],
      puntoVenta: [],
      almacen: [],
      moneda: ['S/'],
    })

    const id = await this.toolsService.mostrarCargando('Cargando')
    await this.listaPuntoVenta();
    await this.listaAlmacen()

    await this.listarListaPrecios()
    this.toolsService.ocultarCargando(id);
  }

  get puntoVenta() {
    return this.buscarForm.value.puntoVenta
  }
  get almacen() {
    return this.buscarForm.value.almacen
  }
  get moneda() {
    return this.buscarForm.value.moneda
  }

  get buscar(){
    return this.buscarForm.value.buscar;
  }

  
  async refresherListas(evento) {
    // console.log('refresherListas')
    this.listaPrecios = []
    this.limite = 50;
    this.inicio = 0
    await this.listarListaPrecios()
    evento.target.complete();
  }

  async filtrarListaPrecio(){
    const id = await this.toolsService.mostrarCargando('Cargando')
    // console.log('filtrarListaPrecio')
    this.listaPrecios = [];
    this.inicio = 0;
    await this.listarListaPrecios();
    this.toolsService.ocultarCargando(id);
  }

  async listarListaPrecios() {
   
    this.listaPreciosService.listaGeneralPrecios(this.puntoVenta, this.almacen, '12', this.moneda, this.buscar, this.limite, this.inicio)
    .then((resp) => {
      // console.log(resp);
      // this.listaPrecios = resp;
      if (resp.length < this.ionInfi) {
        this.estadoRecargar = false
      } else {
        this.estadoRecargar = true
      }

      this.listaPrecios.push(...resp)
      
    }).catch((err) => {
      console.log(err);
    })
  }

  recargarListaPrecios(event: any) {
    // console.log('recargarListaPrecios')
    this.inicio = this.inicio + this.limite

    this.listarListaPrecios()
      .then(() => {
        event.target.complete();
      })
  }
  

  async listaPuntoVenta() {
    return new Promise((resolve) => {
      this.puntoVentaService.listaPuntoVenta('').subscribe((resp) => {
            this.arrPuntoVenta = resp;
            this.buscarForm.patchValue({ puntoVenta: '001' })
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })

  }

  async listaAlmacen() {

    await this.almacenService.listaAlmacenPuntoVenta(this.puntoVenta)
    .then((resp) => {
     
      this.arrAlmacen = resp;
      for (let i = 0; i < resp.length; i++) {
        const element = resp[i];
        if (element.predeterminado == 'S') {
          this.buscarForm.patchValue({ almacen: element.ccod_almacen })
        }
      }
    }).catch((err) => {
      console.log(err);
    })

  }

}
