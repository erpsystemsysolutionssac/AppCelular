import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ClienteService } from 'src/app/service/tomadorPedidos/cliente.service';
import { ToolsService } from 'src/app/service/tools.service';
import { Geolocation } from '@capacitor/geolocation';

import SwiperCore, { SwiperOptions, Navigation, Pagination, A11y, Swiper, Zoom } from 'swiper';
SwiperCore.use([Navigation, Pagination, A11y, Zoom]);

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';

import { Loader } from '@googlemaps/js-api-loader';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from 'src/app/interfaces/interfases';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { PromocionesService } from 'src/app/service/tomadorPedidos/promociones.service';
import { environment } from 'src/environments/environment';
import { IonModal } from '@ionic/angular';

const apiKey = 'AIzaSyCrZ_hKSgj5NwR6b2LnxdR6SfBwqM0geT4';

const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
  libraries: ["places"]
});

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit, OnDestroy {

  @ViewChild('map') map: ElementRef<HTMLElement>;

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true, },
    autoHeight: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    zoom: { maxRatio: 10 }
  };

  public arrImagenes: any[] = []
  public arrDirecciones: any[] = []
  public arrUbigeos: any[] = []

  imagenCambiar: any

  private limite = environment.limiteArticulos
  public ionInfi = environment.limiteArticulos
  private inicio = 0
  public clientes: Cliente[] = []
  private filtro: string = 'cnom_cliente'
  private texto: string = ''
  private lat: number;
  private lng: number;

  private markador: google.maps.Marker

  public scrollear: boolean = true
  public buscarForm: FormGroup;
  public direccionForm: FormGroup;
  public mapaOpen = false
  public imagenesOpen = false
  public direccionesOpen = false
  public ubigeoOpen = false
  public formOpenDireccion: boolean = false;
  public eventoDireccion: string = '';
  public clienteSeleccionado: string = '';
  public isAgregarDireccion: boolean = false;

  private subscripcion: Subscription

  constructor(
    public clienteService: ClienteService,
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private sanitizer: DomSanitizer,
    private carrito: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private articuloSe: ArticuloService,
    private promoS: PromocionesService
  ) {
    let tableA = [{ id: '1', name: 'name1', age: '31', gender: 'male', class: 'B' },
    { id: '2', name: 'name2', age: '38', gender: 'male', class: 'A' },
    { id: '3', name: 'name3', age: '35', gender: 'male', class: 'C' },
    { id: '4', name: 'name4', age: '20', gender: 'female', class: 'B' },
    { id: '5', name: 'name5', age: '19', gender: 'female', class: 'A' },
    { id: '6', name: 'name6', age: '31', gender: 'male', class: 'A' }
    ];
    let filters = [{ type: 'gender', value: "male" }, { type: 'age', value: "31" }];
    let filteredArr = []
    for (const data of tableA) {
      for (const filter of filters) {
        if (data[filter.type] == filter.value) { 
        }
      }
    }
  }

  async ngOnInit() {
    console.log('ClientesComponent')
    this.posicionActual()
    this.buscarForm = this.fb.group({
      buscar: ''
    })
    this.direccionForm = this.fb.group({
      item: [''],
      direccion: ['', [Validators.required]],
      ubigeo: [{ value: '', disabled: true }, [Validators.required]],
    })
    let idLoading = await this.toolsService.mostrarCargando()
    await this.listarClientes()
    await this.toolsService.ocultarCargando(idLoading)
    this.subscripcion = this.clienteService._refresh$.subscribe(() => {
      this.clientes = []
      this.limite = environment.limiteArticulos
      this.inicio = 0
      this.listarClientes()
    })
  }

  async refresherClientes(event) {
    this.clientes = []
    this.limite = environment.limiteArticulos
    this.inicio = 0
    await this.listarClientes()
    event.target.complete();

  }

  //#region Prueba 

  async probando() {
    let arrFunc: ((d: string | number) => Promise<string>)[] = []
    let arrDatos: (number | string)[] = []
    // for (let i = 1; i <= 5; i++) {
    //   arrFunc.push(this.probando2)
    //   arrDatos.push(i)
    // }
    // await Promise.all(arrFunc.map((funci,i)=>funci(arrDatos[i])))
    // .then((resp)=>{
    // })

    this.probando3('callbacka', (resp) => {
    })

  }

  probando2(dato: string | number): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('promesa ' + dato)
      }, 2000);
    })
  }

  probando3(dato: string, callb?: ((d: string) => void)) {
    if (typeof callb == 'function') {
      callb(dato)
    }
  }
  //#endregion

  async posicionActual() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });
      // this.lat=coordinates.coords.latitude
      this.lat = coordinates.coords.latitude
      this.lng = coordinates.coords.longitude
    } catch (e) {
      console.log(e)
    }
  };

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

  recargarClientes(event: any) {
    this.inicio += this.limite
    this.listarClientes().then((estado) => {
      if (estado) {
        event.target.complete();
      }
    })
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

  async abrirMapaModal(latitud: number | null, longitud: number | null) {
    this.mapaOpen = true
    if (latitud != null || longitud != null) {
      this.lat = latitud
      this.lng = longitud
    }
    else {
      await this.posicionActual()
    }
  }

  async cerrarMapaModal() {
    // await this.mapaInst.destroy();
    this.mapaOpen = false
  }

  modalMapaSeCerro() {
    this.mapaOpen = false
  }

  async modalMapaListo() {
    const mapRef = this.map.nativeElement
    const mapRef2 = document.getElementById('map');

    loader
      .load()
      .then((google) => {
        let Google = google.maps
        console.log({lat: this.lat, lng: this.lng})
        const map = new Google.Map(mapRef, {
          center: {
            lat: this.lat,
            lng: this.lng,
          },
          zoom: 15
        })

        this.markador = new Google.Marker({
          position: {
            lat: this.lat,
            lng: this.lng,
          },
          map: map
        });
        //acaba el then
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
    this.carrito.agregarCliente(cliente)

    this.router.navigate(['../carrito'], { relativeTo: this.route })
    this.clienteService.clientesOn = false
    this.buscarForm.reset()

    if (this.carrito.arrCarrito.length == 0) {
      this.articuloSe.refrescar()
      this.promoS.refrescar()
      await this.toolsService.ocultarCargando(idLoading)
      return
    }

    await this.toolsService.ocultarCargando(idLoading)

  }

  //#region imagenes

  abrirImagenesModal(cliente: Cliente) {
    this.imagenesOpen = true
    let ind = 1
    this.arrImagenes = []
    Object.entries(cliente).forEach(([key, val]) => {
      if (key.includes('imagen')) {
        this.arrImagenes.push({ nro: ind, src: val })
      }
    })
  }

  cerrarImagenesModal() {
    this.imagenesOpen = false
  }

  modalImgSeCerro() {
    this.imagenesOpen = false
  }

  onSwiper(swiper: Swiper) {
    this.imagenCambiar = this.arrImagenes.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  onSlideChange([swiper]) {
    this.imagenCambiar = this.arrImagenes.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  async cambiarGaleria() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    let imageUrl = image.webPath;
    const response = await fetch(image.webPath);
    // const blob = await response.blob();
    this.imagenCambiar.src = this.sanitizer.bypassSecurityTrustUrl(response.url)
  }

  async borrarImagen() {
    if (this.imagenCambiar.src == '') {
      return
    }
    let borrar: boolean
    await this.toolsService.confirmarAlerta('Se borrara la imagen', 'warning').then((resp) => {
      borrar = resp
    })
    if (borrar) {
      this.imagenCambiar.src = ''
    }
  }
  //#endregion

  //#region DIRECCIONES ALTERNATIVAS

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

  cerrarFormDireccion(){
    this.formOpenDireccion = false;
    this.isAgregarDireccion = false;
    this.ubigeoOpen = false;
    // this.direccionForm.reset();
    // this.direccionForm.enable();
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

  //#endregion

  ngOnDestroy(): void {
    console.log('destruidoClientes');

    if (!this.subscripcion.closed) {
      this.subscripcion.unsubscribe()
    }
    // this.clienteService._refresh$.unsubscribe()
  }



}
