import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Cliente } from 'src/app/interfaces/cliente';
import { clienteService } from 'src/app/service/mantenimiento/cliente.service';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { ToolsService } from 'src/app/service/tools.service';
import { environment } from 'src/environments/environment';
import { ModalImagenesClienteComponent } from '../modal-imagenes-cliente/modal-imagenes-cliente.component';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
})
export class ListaClientesComponent implements OnInit {
  public formulario: FormGroup;
  public direccionForm: FormGroup;

  public clientes: Cliente[] = [];
  private texto: string = '';
  private filtro: string = 'cnom_cliente'

  public arrDirecciones: any[] = []
  public arrUbigeos: any[] = []
  public direccionesOpen = false
  public ubigeoOpen = false
  public formOpenDireccion: boolean = false;
  public eventoDireccion: string = '';
  public clienteSeleccionado: string = '';
  public isAgregarDireccion: boolean = false;

  private limite = environment.limiteArticulos
  private inicio = 0
  public ionInfi = environment.limiteArticulos
  public scrollear: boolean = true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private toolsService: ToolsService,
    public clienteService: clienteService,
    public carritoService: CarritoService,
    private productoService: ProductoService
  ) { }

  async ngOnInit() {
    this.formulario = this.fb.group({
      buscar: ''
    });

    this.direccionForm = this.fb.group({
      item: [''],
      direccion: ['', [Validators.required]],
      ubigeo: [{ value: '', disabled: true }, [Validators.required]],
    });

    let idLoading = await this.toolsService.mostrarCargando()
    await this.listarClientes()
    await this.toolsService.ocultarCargando(idLoading)
    // this.subscripcion = this.clienteService._refresh$.subscribe(() => {
    //   this.clientes = []
    //   this.limite = environment.limiteArticulos
    //   this.inicio = 0
    //   this.listarClientes()
    // })
  }

  async buscarClientes(form: FormGroup) {
    let inpBuscar = form.controls.buscar
    if (inpBuscar.pristine) return

    this.texto = inpBuscar.value
    this.limite = 25
    this.inicio = 0
    this.clientes = []

    let idLoading = await this.toolsService.mostrarCargando()
    this.listarClientes().then(async (resp) => {
      await this.toolsService.ocultarCargando(idLoading)
    })
  }

  listarClientes() {
    return new Promise(async (resolve, reject) => {
      this.clienteService.listarClientes(this.limite, this.inicio, this.filtro, this.texto)
        .then((resp) => {
          if (resp.length < this.ionInfi) {
            this.scrollear = false
          }
          else {
            this.scrollear = true
          }
          this.clientes.push(...resp);
          resolve(true)
        }).catch((err => {
          console.log(err);

        }))

    })
  }

  async refresherClientes(event) {
    this.clientes = []
    this.limite = environment.limiteArticulos
    this.inicio = 0
    await this.listarClientes()
    event.target.complete();
  }

  recargarClientes(event: any) {
    this.inicio += this.limite
    this.listarClientes().then((estado) => {
      if (estado) {
        event.target.complete();
      }
    })
  }

  async agregarCarritoCliente(cliente: Cliente) {
   
    if (!this.clienteService.clientesOn) return

    let idLoading: string
    idLoading = await this.toolsService.mostrarCargando()
    await this.clienteService.clienteFormasPago(cliente.ccod_cliente).then((resp) => {
      cliente.forma_pagos = resp
    })

    await this.clienteService.clienteDirecciones(cliente.ccod_cliente).then((resp) => {
      cliente.direcciones = resp
    })
    await this.clienteService.clienteAgencias(cliente.ccod_cliente).then((resp) => {
      cliente.agencias = resp
    })

    this.carritoService.agregarCliente(cliente)

    this.router.navigate(['../carrito'], { relativeTo: this.route })
    this.clienteService.clientesOn = false
    this.formulario.reset()

    if (this.carritoService.arrayCarrito.length == 0) {
      this.productoService.refrescar()
      // this.promoS.refrescar()
      await this.toolsService.ocultarCargando(idLoading)
      return
    }

    await this.toolsService.ocultarCargando(idLoading)

  }
  
  async abrirDireccionesAlternativasModal(cliente: Cliente) {
    let idLoading = await this.toolsService.mostrarCargando()
    this.direccionesOpen = true;
    this.formOpenDireccion = false;
    this.arrDirecciones = [];
    this.clienteSeleccionado = cliente.ccod_cliente;

    await this.clienteService.clienteDireccionesAlternativas(cliente.ccod_cliente)
      .then((resp) => {
        this.arrDirecciones = resp;
      }).catch((err => {
        console.log(err);
      }))

    await this.clienteService.listaUbigeo()
      .then((resp) => {
        this.arrUbigeos = resp;
      }).catch((err => {
        console.log(err);
      }))

    await this.toolsService.ocultarCargando(idLoading)
  }

  cerrarDireccionesAlternativasModal() {
    this.direccionesOpen = false;
    this.cerrarFormDireccion();
  }

  cerrarFormDireccion(){
    this.formOpenDireccion = false;
    this.isAgregarDireccion = false;
    this.ubigeoOpen = false;
  }

  abrirModalUbigeos() {
    this.ubigeoOpen = true;
  }

  ubigeoSelectionChanged(ubigeos: any) {
    this.direccionForm.patchValue({
      ubigeo: ubigeos.Codigo,
    })
    this.ubigeoOpen = false
  }

  cerrarModalUbigeos() {
    this.ubigeoOpen = false;
  }

  async guardarDireccion(form: FormGroup) {
    let arrPromises: Promise<any>[] = [];
    let mensaje: string = '';
    if (form.invalid) {
      form.markAllAsTouched()
      this.toolsService.mostrarAlerta('Complete los Datos', 'warning')
      return
    }

    let idLoading = await this.toolsService.mostrarCargando('Agregando')
    let dataAgencia = form.getRawValue();
    dataAgencia.codigo_cliente = this.clienteSeleccionado;
  
    switch (this.eventoDireccion) {
      case 'guardar':
        arrPromises.push(this.clienteService.agregarDireccionAlternativa(dataAgencia));
        mensaje = 'Direccion Agregada';
        break;
      case 'editar':
        arrPromises.push(this.clienteService.editarDireccionAlternativa(dataAgencia));
        mensaje = 'Direccion Modificada';
        break;
      case 'eliminar':
        arrPromises.push(this.clienteService.eliminarDireccionAlternativa(dataAgencia));
        mensaje = 'Direccion Eliminada';
        break;
    }

    await Promise.all(arrPromises).then(async (resp) => {
      if (resp[0].estado) {

        this.toolsService.mostrarAlerta(mensaje, 'success')
        this.direccionForm.reset();
        this.cerrarFormDireccion();

        await this.clienteService.clienteDireccionesAlternativas(this.clienteSeleccionado)
          .then((resp) => {
            this.arrDirecciones = resp;
          }).catch((err => {
            console.log(err);
          }))
      } else {

        this.toolsService.mostrarAlerta('Ocurrio un error: ' + resp[0].mensaje, 'error')
      }
      await this.toolsService.ocultarCargando(idLoading)
    }).catch(async (err) => {
      console.log(err);
      await this.toolsService.ocultarCargando(idLoading)

    })
  }

  changeEstadoDirrecion(dato) {
   
    if (dato.direccion) {
      let fromDireccion = dato.direccion
      this.direccionForm.patchValue({
        item: fromDireccion.item,
        direccion: fromDireccion.direccion,
        ubigeo: fromDireccion.ubigeo,
      })
    }

    this.formOpenDireccion = dato.formOpen;
    this.eventoDireccion = dato.evento;
    this.isAgregarDireccion = true;
  }

  async abrirMapaModal(latitud: number | null, longitud: number | null) {
    // this.mapaOpen = true
    // if (latitud != null || longitud != null) {
    //   this.lat = latitud
    //   this.lng = longitud
    // }
    // else {
    //   await this.posicionActual()
    // }
  }

  async abrirImagenesModal(cliente: Cliente) {
    const modal = await this.modalCtrl.create({
      component: ModalImagenesClienteComponent,
      componentProps: {
        data: cliente
      }
    });

    await modal.present();
    // this.imagenesOpen = true
    // let ind = 1
    // this.arrImagenes = []
    // Object.entries(cliente).forEach(([key, val]) => {
    //   if (key.includes('imagen')) {
    //     this.arrImagenes.push({ nro: ind, src: val })
    //   }
    // })
  }

}
