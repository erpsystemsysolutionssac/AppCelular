import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from 'src/app/service/tomadorPedidos/cliente.service';
import { ToolsService } from 'src/app/service/tools.service';
import { Cliente, Ubigeo } from 'src/app/interfaces/interfases';
import { LoginService } from 'src/app/service/login.service';

import { Loader } from '@googlemaps/js-api-loader';
import { Geolocation } from '@capacitor/geolocation';

import SwiperCore, { SwiperOptions, Navigation, Pagination, A11y, Swiper } from 'swiper';
SwiperCore.use([Navigation, Pagination, A11y]);
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { ListaPreciosService } from 'src/app/service/mantenimiento/lista-precios.service';
import { SituacionService } from 'src/app/service/mantenimiento/situacion.service';



const apiKey = 'AIzaSyCrZ_hKSgj5NwR6b2LnxdR6SfBwqM0geT4';

const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
  libraries: ["places"]
});

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent implements OnInit {

  @ViewChild('cropperModal') cropperModal: IonModal;
  @ViewChild('cropper') cropper: ImageCropperComponent;
  public imgCropear: any;
  public croppedImage: any = '';
  public cropperLoading: boolean = true



  @ViewChild('map') map: ElementRef<HTMLElement>;
  public lat: number;
  public lng: number;
  private verificarLatLng: boolean = false
  private markador: google.maps.Marker
  private mapaActivo: google.maps.Map


  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true, },
    autoHeight: true,
    centeredSlides: true,
    centeredSlidesBounds: true

  };
  imagenesArr = []
  imagenCambiar: any
  imagenNombre: string

  public arrTipDocumento = []
  public arrPais: Ubigeo[] = []
  public arrDepartamento: Ubigeo[] = []
  public arrCiudad: Ubigeo[] = []
  public arrDistrito: Ubigeo[] = []
  public arrGrupoCliente: any[] = []
  public arrZona01: any[] = []
  public arrListaPrecios: any[] = []
  public arrSituacion01: any[] = []

  public ccod_cliente: string
  public clienteForm: FormGroup
  public digitosNroDocu: number = 20
  public btnDisabled = false
  public agregarValido = true
  public cargando = false
  public estadoRuc = false
  public agregandoCliente = false

  public clienteEditar: Cliente[]
  public codCiudad: string = '';
  public codDistrito: string = '';
  public editarEstado: boolean = false

  public ventanaActiv: string = 'Datos'

  constructor(
    private route: ActivatedRoute, private router: Router,
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private sanitizer: DomSanitizer,
    private logins: LoginService,
    private listaPreciosService: ListaPreciosService,
    private situacionService: SituacionService
  ) {
  }

  ngOnInit() {
    console.log('ClienteComponent')
    this.clienteForm = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      nroDocumento: ['', [Validators.required]],
      tipoCliente: ['12', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidoP: ['', [Validators.required]],
      apellidoM: ['', [Validators.required]],
      nombreComercial: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: [''],
      email: [''],
      listaPrecio: ['', [Validators.required]],
      zona01: ['', []],
      situacion01: ['', []]
    });

    this.route.params.subscribe(async (param) => {
      this.clienteEditar = []
      this.imagenesArr = []

      this.ccod_cliente = param.ccod_cliente
      if (this.ccod_cliente == 'nuevo') {
        this.btnDisabled = false
        for (let index = 1; index <= 4; index++) {
          this.imagenesArr.push({ nro: index, src: '', change: false, blob: null, name: '', borrar: false, namePrev: '' })
        }

      } else {
        let idLoading = await this.toolsService.mostrarCargando('Cargando')

        await this.clienteService.obtenerCliente(this.ccod_cliente).then(async (resp) => {
   
          this.clienteEditar.push(...resp)

          if (this.clienteEditar[0].lng != null || this.clienteEditar[0].lat != null) {
            this.lat = this.clienteEditar[0].lat
            this.lng = this.clienteEditar[0].lng
            this.verificarLatLng = true
          } else {
            this.verificarLatLng = false
            await this.posicionActual()
          }
          let ind = 1
          for (let [key, value] of Object.entries(this.clienteEditar[0])) {
            if (key.includes('imagen')) {

              if (value == null) value = ''
              this.imagenesArr.push({ nro: ind, src: value, change: false, blob: null, name: '', borrar: false, namePrev: value })
              ind++
            }
          }
          this.editarEstado = true
          this.btnDisabled = true
          this.clienteForm.patchValue({
            nombres: this.clienteEditar[0].erp_nombres == null || this.clienteEditar[0].erp_nombres.length == 0 ? this.clienteEditar[0].cnom_cliente : this.clienteEditar[0].erp_nombres,

            apellidoP: this.clienteEditar[0].erp_apepat == null || this.clienteEditar[0].erp_apepat.length == 0 ? ' ' : this.clienteEditar[0].erp_apepat,

            apellidoM: this.clienteEditar[0].erp_apemat == null || this.clienteEditar[0].erp_apemat.length == 0 ? ' ' : this.clienteEditar[0].erp_apemat,

            nombreComercial: this.clienteEditar[0].tip_doc == '05' ? this.clienteEditar[0].cnom_cliente : '',
            direccion: this.clienteEditar[0].cdireccion,
            telefono: this.clienteEditar[0].ctelefonos,
            email: this.clienteEditar[0].ce_mail
          })
          this.clienteForm.controls.nroDocumento.disable()
          this.clienteForm.controls.tipoDocumento.disable()
        })
        await this.toolsService.ocultarCargando(idLoading)

      }
      this.listarTipoDocumento(this.clienteEditar)
      this.listaPais(this.clienteEditar)

      this.listarGrupoClientes(this.clienteEditar)
      this.listarZona01(this.clienteEditar);
      this.listarSituacion(this.clienteEditar);
      this.listarPrecios(this.clienteEditar);

      await this.listaDepartamento(this.clienteEditar)
      await this.listaCiudad(this.clienteEditar)
      await this.listaDistrito(this.clienteEditar)
    })

    this.posicionActual()

  }


  //#region  Gets
  get cliente() {
    return this.clienteForm.controls.cliente
  }
  get nombreComercial() {
    return this.clienteForm.controls.nombreComercial
  }
  get direccion() {
    return this.clienteForm.controls.direccion
  }
  get telefono() {
    return this.clienteForm.controls.telefono
  }
  get email() {
    return this.clienteForm.controls.email
  }

  //#endregion

  cambiarVentana(algo: any) {
    this.ventanaActiv = algo.detail.value
    if (this.ventanaActiv == 'Ubicacion') {
      setTimeout(() => {
        this.mapaUbicacion()
      }, 0);
    }
  }

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

  async mapaUbicacion() {
    const mapRef = this.map.nativeElement

    if (this.mapaActivo == undefined) {
      await loader
        .load()
        .then((google) => {
          this.mapaActivo = new google.maps.Map(mapRef, {
            center: {
              lat: this.lat,
              lng: this.lng,
            },
            zoom: 15
          })

          this.markador = new google.maps.Marker({
            position: {
              lat: this.lat,
              lng: this.lng,
            },
            map: this.mapaActivo,
            draggable: true,
          });

        })
    }
    this.mapaActivo.addListener('click', (e) => {
      this.markador.setMap(null)
      this.lat = e.latLng.lat()
      this.lng = e.latLng.lng()

      this.markador = new google.maps.Marker({
        position: e.latLng,
        map: this.mapaActivo,
        draggable: true,
      });
      this.mapaActivo.panTo(e.latLng);
    })

    this.markador.addListener('dragend', (e) => {
      this.lat = e.latLng.lat()
      this.lng = e.latLng.lng()
      let datos: google.maps.LatLng = e.latLng
      this.mapaActivo.panTo(datos);
    })

  }

  //#region imagenes
  onSwiper(swiper: Swiper) {
    this.imagenCambiar = this.imagenesArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  onSlideChange([swiper]) {
    this.imagenCambiar = this.imagenesArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  async cambiarGaleria() {
    const image = await Camera.getPhoto({
      quality: 25,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Escoger de la Galeria',
      promptLabelPicture: 'Tomar Foto',
      promptLabelHeader: 'Foto'
    })
    await this.cropperModal.present()
    let imageUrl = image.webPath;
    this.imagenNombre = new Date().getTime() + '.' + image.format
    this.imgCropear = imageUrl
    this.cropperLoading = true
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
      this.imagenCambiar.blob = null
      this.imagenCambiar.change = false
      this.imagenCambiar.borrar = true
    }
  }
  imageLoaded() {
    this.cropperLoading = false
  }

  loadImageFailed() {
    console.log('loadImageFailed');
  }

  async generarCropper() {
    this.cropperModal.dismiss()
    const response = await fetch(this.cropper.crop().base64);
    const blob = await response.blob();
    this.imagenCambiar.src = this.sanitizer.bypassSecurityTrustUrl(response.url)
    this.imagenCambiar.name = this.imagenNombre
    this.imagenCambiar.change = true
    this.imagenCambiar.blob = blob
    this.imagenCambiar.borrar = false
    this.imgCropear = ''
  }

  async cancel() {
    this.imgCropear = ''
    this.cropperLoading = true
    await this.cropperModal.dismiss();
  }

  //#endregion

  listarTipoDocumento(clienteE: Cliente[]) {
    this.clienteService.listarTipoDocumento()
      .then((resp: []) => {

        this.arrTipDocumento.push(...resp)
        if (clienteE.length == 0) return
        this.clienteForm.patchValue({
          tipoDocumento: clienteE[0].tip_doc, nroDocumento: this.clienteEditar[0].ndoc_id,
        })

      })
  }

  listarZona01(clienteE: Cliente[]) {
    this.clienteService.listaZona01()
      .then((resp: []) => {

        this.arrZona01.push(...resp)
        if (clienteE.length == 0) {
          this.clienteForm.patchValue({ zona01: "00" })
        } else {
          this.clienteForm.patchValue({ zona01: clienteE[0].ccod_zona })
        }

      })
  }

  listarSituacion(clienteE: Cliente[]) {
    this.situacionService.listarSituacion()
      .then((resp: []) => {

        this.arrSituacion01.push(...resp)
        if (clienteE.length == 0) {
          this.clienteForm.patchValue({ situacion01: "00" })
        } else {
          this.clienteForm.patchValue({ situacion01: clienteE[0].situacion })
        }
      })
  }

  async listarPrecios(clienteE: Cliente[]) {

    return new Promise((resolve) => {
      this.listaPreciosService.listaPrecios('12').subscribe((resp) => {
        this.arrListaPrecios = resp;

        if (clienteE.length == 0) {
          this.clienteForm.patchValue({ listaPrecio: "01" })
        } else {
          this.clienteForm.patchValue({ listaPrecio: clienteE[0].lista_precios })
          
        }
        resolve('acabo')
      }, (err) => {
        this.toolsService.mostrarAlerta(err, 'error')
        console.log(err);
      })
    })
  }

  listarGrupoClientes = (clienteE: Cliente[]) => {
    this.clienteService.listarGrupoClientes()
      .then((resp: any) => {
        this.arrGrupoCliente.push(...resp.resp)
        if (clienteE.length == 0) return
        this.clienteForm.patchValue({ tipoCliente: clienteE[0].cgrupo_cliente })


      })


  }

  async verificarDocumento(form: FormGroup) {

    let tipoDocumento = form.controls.tipoDocumento
    let nroDocumento = form.controls.nroDocumento
    let todoCorrecto = false

    if (tipoDocumento.invalid || nroDocumento.invalid) {
      tipoDocumento.markAsTouched()
      nroDocumento.markAsTouched()
      return
    }

    let tipoDoc = this.arrTipDocumento.find((tip) => {
      return tip.ccod_tdid == tipoDocumento.value
    }).Codigo

    this.cargando = true

    if (tipoDoc == 'DNI' || tipoDoc == 'RUC') {

      await Promise.all([
        this.clienteService.verificarDocumento(tipoDocumento.value, nroDocumento.value),
        this.clienteService.consultarDocumento(nroDocumento.value, tipoDoc)])
        .then((resp: any[]) => {

          this.cargando = false
          this.btnDisabled = false
          if (resp[0].length) {
            this.toolsService.mostrarAlerta('El Cliente ya existe', 'error')
            return
          }
          if (resp[1].error) {
            this.toolsService.mostrarAlerta(resp[1].error, 'error')
            return
          }
          this.clienteForm.patchValue({
            "nombres": resp[1].nombre,
            "apellidoP": resp[1].apellidoMaterno,
            "apellidoM": resp[1].apellidoPaterno,
            'cliente': resp[1].nombre,
            'nombreComercial': resp[1].nombre,
            'direccion': resp[1].direccion
          })
          todoCorrecto = true
        }).catch((err) => {
          this.toolsService.mostrarAlerta(err.message, 'error')
        })
    }
    else {
      await this.clienteService.verificarDocumento(tipoDocumento.value, nroDocumento.value)
        .then((resp: any[]) => {
          this.cargando = false
          this.btnDisabled = false
          if (resp.length) {
            this.toolsService.mostrarAlerta('El Cliente ya existe', 'error')
            return
          }
          todoCorrecto = true
        })
    }

    if (!todoCorrecto) {

      return
    }

    this.toolsService.mostrarAlerta('Cliente disponible', 'success')

    this.btnDisabled = true
    this.agregarValido = false

    this.clienteForm.controls.nroDocumento.disable()
    this.clienteForm.controls.tipoDocumento.disable()


  }

  limiteDocu(e) {

    if (e.detail.value == '') {
      return
    }
    let tipoDoc = this.arrTipDocumento.find((tip) => {
      return tip.ccod_tdid == e.detail.value
    })
    this.digitosNroDocu = tipoDoc.digitos

    if (tipoDoc.ccod_tdid == '05') {
      this.estadoRuc = true
      this.clienteForm.patchValue({
        nombres: '',
        apellidoP: '',
        apellidoM: '',
        nroDocumento: ''
      })
      this.clienteForm.controls.nombreComercial.enable()

      this.clienteForm.controls.nombres.disable()
      this.clienteForm.controls.apellidoP.disable()
      this.clienteForm.controls.apellidoM.disable()


    }
    else {
      this.clienteForm.patchValue({
        nombreComercial: '',
        nroDocumento: ''
      })
      this.clienteForm.controls.nombres.enable()
      this.clienteForm.controls.apellidoP.enable()
      this.clienteForm.controls.apellidoM.enable()

      this.clienteForm.controls.nombreComercial.disable()

      this.estadoRuc = false
    }

  }

  maxNroDocumento(e) {
    let val = e.detail.value
    val = val.slice(0, this.digitosNroDocu)
    this.clienteForm.patchValue({
      nroDocumento: val
    })
  }

  subirImagenes() {
    const formImagenes: FormData = new FormData();
    let arrBorrar: any[] = []
    let cambiarImg: boolean = false
    let arrOrden: any[] = []
    let arrNombrePrev: any[] = []

    for (const imagen of this.imagenesArr) {
      if (imagen.change) {
        cambiarImg = true
        console.log(imagen.nro + ' con blob');
        formImagenes.append('imagenes', imagen.blob, imagen.name);
        arrNombrePrev.push(imagen.namePrev)
        arrOrden.push(imagen.nro)

      }
      if (imagen.borrar) {
        cambiarImg = true
        arrBorrar.push({ name: imagen.name, ordenBor: imagen.nro, namePrev: imagen.namePrev })
      }
    }
    if (arrOrden.length > 0) {
      formImagenes.append('ordenSub', JSON.stringify(arrOrden));

      formImagenes.append('namePrev', JSON.stringify(arrNombrePrev));
    }

    if (arrBorrar.length > 0) {
      formImagenes.append('borrar', JSON.stringify(arrBorrar));
    }
    if (cambiarImg) {
      formImagenes.append('ccod_cliente', this.ccod_cliente);
      return this.clienteService.editarClienteImagenes(formImagenes, this.toolsService.fechaYHora())
    }
  }

  async agregarCliente(form: FormGroup) {
    let arrPromises: Promise<any>[] = []
    if (form.invalid) {
      form.markAllAsTouched()
      this.toolsService.mostrarAlerta('Complete los Datos', 'warning')
      return
    }

    this.ccod_cliente = form.value.nroDocumento

    let erpDatos = this.datosClienteErpSys(form.getRawValue())
    erpDatos.Listas_Precios = this.listaPrecios(erpDatos.Lista_precios_determinado)
    erpDatos.Lista_forma_pago_elegidos = this.Lista_forma_pago_elegidos()
    erpDatos.Lista_detracciones_elegidos = this.Lista_detracciones_elegidos()

    this.agregandoCliente = true
    this.agregarValido = true

    let idLoading = await this.toolsService.mostrarCargando('Agregando')

    arrPromises.push(this.clienteService.editarClienteCords(this.ccod_cliente,
      { lat: this.lat, lng: this.lng },
      this.toolsService.fechaYHora(),
      this.verificarLatLng
    ))

    arrPromises.push(this.subirImagenes())

    arrPromises.push(this.clienteService.agregarCliente(erpDatos))

    await Promise.all(arrPromises).then(async (resp) => {
      if (resp[2].estado) {
        this.agregandoCliente = false
        this.agregarValido = false
        this.toolsService.mostrarAlerta('Cliente Agregado', 'success')
        this.clienteForm.reset()
        this.btnDisabled = false
        this.agregarValido = true
        this.clienteForm.enable()
        this.router.navigate(['../'], { relativeTo: this.route })
        this.clienteService.refresh()
      } else {
        this.agregandoCliente = false
        this.agregarValido = false
        console.log(resp[2].mensaje);
        this.toolsService.mostrarAlerta('Ocurrio un error', 'error')
      }
      await this.toolsService.ocultarCargando(idLoading)
    }).catch(async (err) => {
      console.log(err);
      await this.toolsService.ocultarCargando(idLoading)

    })


  }

  async editarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched()
      this.toolsService.mostrarAlerta('Complete los Datos', 'warning')
      return
    }
    let idLoading = await this.toolsService.mostrarCargando('Editando')



    let datosCliente = this.clienteForm.getRawValue()
    datosCliente.departamento = datosCliente.departamento
    datosCliente.ccod_cliente = this.ccod_cliente
    datosCliente.fecha_modificacion = this.toolsService.fechaYHora()
    datosCliente.ciudad = datosCliente.ciudad.substring(2, 4)
    datosCliente.distrito = datosCliente.distrito.substring(4, 6)


    if (datosCliente.tipoDocumento == '05') {
      datosCliente.cnom_cliente = datosCliente.nombreComercial
      datosCliente.apellidoP = ''
      datosCliente.apellidoM = ''
      datosCliente.nombres = ''
    } else {
      datosCliente.cnom_cliente = datosCliente.nombres + ' ' + datosCliente.apellidoP + ' ' + datosCliente.apellidoM
      datosCliente.apellidoP = datosCliente.apellidoP.replace(/\s/g, '')
      datosCliente.apellidoM = datosCliente.apellidoM.replace(/\s/g, '')
    }

    let arrPromises: Promise<any>[] = []

    arrPromises.push(this.clienteService.editarClienteCords(this.ccod_cliente,
      { lat: this.lat, lng: this.lng },
      this.toolsService.fechaYHora(),
      this.verificarLatLng)
    )

    arrPromises.push(this.subirImagenes())

    arrPromises.push(this.clienteService.editarCliente(datosCliente))

    await Promise.all(arrPromises).then(async (resp) => {

      if (resp[2].affectedRows) {
        this.toolsService.mostrarAlerta('Cliente Editado', 'success')
        this.clienteService.refresh()
        this.router.navigate(['../'], { relativeTo: this.route })
      } else {
        console.log(resp);
      }
      await this.toolsService.ocultarCargando(idLoading)
    }).catch((err) => {
      console.log(err);
    })

  }

  cancelar() {
    this.clienteForm.reset()
    this.btnDisabled = false
    this.agregarValido = true
    this.clienteForm.enable()
    this.editarEstado = false
    this.router.navigate(['../'], { relativeTo: this.route })
  }


  //#region  Ubigeo

  listaPais(clienteE: Cliente[]) {
    this.clienteService.listaPais()
      .then((resp) => {
        this.arrPais.push(...resp)
        this.clienteForm.patchValue({
          pais: '001'
        })
        if (clienteE.length == 0) return
        this.clienteForm.patchValue({
          pais: clienteE[0].ccod_pais
        })

      }).catch((err) => {
        console.log(err);
        this.toolsService.mostrarAlerta(err.msg, 'error')
      })
  }

  async listaDepartamento(clienteE: Cliente[]) {
    let departamentoControl = this.clienteForm.controls.departamento
    await this.clienteService.listaDepartamento()
      .then((resp) => {
        this.arrDepartamento.push(...resp)

        if (departamentoControl.touched) {
          this.clienteForm.patchValue({
            ciudad: ''
          })
        }
        else {
          this.clienteForm.patchValue({
            departamento: '15'
          })
        }

        if (clienteE.length == 0) return

        this.codCiudad = clienteE[0].ccod_departamento + clienteE[0].cciudad;
        this.codDistrito = this.codCiudad + clienteE[0].cdistrito;

        this.clienteForm.patchValue({ departamento: clienteE[0].ccod_departamento })

      })
      .catch((err) => {
        console.log(err);
        this.toolsService.mostrarAlerta(err.msg, 'error')
      })
  }

  async listaCiudad(e: any) {
    let departamento = this.clienteForm.controls.departamento
    let cod: string
    cod = departamento.value
    await this.clienteService.listaCiudad(cod)
      .then((resp) => {
        this.arrCiudad = []
        this.arrCiudad.push(...resp)
        if (departamento.touched) {
          this.clienteForm.patchValue({ ciudad: '', distrito: '' })
        } else {
          if (this.codCiudad.length == 0) {
            this.clienteForm.patchValue({ ciudad: '1501' })
          } else {
            this.clienteForm.patchValue({ ciudad: this.codCiudad })
          }
        }
      })
      .catch((err) => {
        console.log(err);
        this.toolsService.mostrarAlerta(err.msg, 'error')
      })

  }

  listaDistrito(e: any) {
    let ciudad = this.clienteForm.controls.ciudad
    let cod: string
    cod = ciudad.value
    this.clienteService.listaDistrito(cod)
      .then((resp) => {
        this.arrDistrito = []
        this.arrDistrito.push(...resp)
        if (ciudad.touched) {
          this.clienteForm.patchValue({ distrito: '' })
        }
        else {
          if (this.codDistrito.length == 0) {
            this.clienteForm.patchValue({ distrito: '150101' })
          } else {
            this.clienteForm.patchValue({ distrito: this.codDistrito })
          }
        }
      })
      .catch((err) => {
        console.log(err);
        this.toolsService.mostrarAlerta(err.msg, 'error')
      })

  }

  //#endregion

  //#region guardarErp

  listaPrecios(listaPrecioActiva: string) {
    let objListaPrecio = []
    for (let i = 1; i <= 7; i++) {
      let activo = 0

      let cod: string | number = '0' + i
      if (i > 9) cod = i

      if (listaPrecioActiva == cod) {
        activo = 1
      }

      objListaPrecio.push({
        erp_activo: activo,
        erp_codlista: cod,
        erp_tipo: '12'
      })
    }

    return JSON.stringify(objListaPrecio)
  }

  Lista_forma_pago_elegidos() {
    let objListaFormaPago = []
    for (let i = 0; i == 0; i++) {
      let cod: string | number = '0' + i
      if (i > 9) cod = i

      objListaFormaPago.push({
        ccod_forpago: cod,
        selec: 'S',
        n_item: i + 1
      })
    }
    return JSON.stringify(objListaFormaPago)
  }
  Lista_detracciones_elegidos() {
    let objListaFormaPago = [
      {
        CCOD_DETRACCION: '00',
        PORCENTAJE: 0,
        PREDET: 'S',
        SEL: ''
      }
    ]
    return JSON.stringify(objListaFormaPago)
  }

  datosClienteErpSys(datos: any) {

    let ciudad = datos.ciudad.substring(2, 4)
    let distrito = datos.distrito.substring(4, 6)

    let tipoDocumento = datos.tipoDocumento
    let paisSys = datos.pais

    return {
      codigo_empresa: '',
      codigo_usuario: '',
      Codigo: datos.nroDocumento,
      Grupo_clientes: datos.tipoCliente,
      Tipo_cliente: datos.tipoDocumento == '05' ? 'Juridico' : 'Natural',
      Tipo_documento_identidad: tipoDocumento,
      Numero_documento: datos.nroDocumento,
      Numero_ruc: tipoDocumento == '05' ? datos.nroDocumento : '',
      Numero_dni: tipoDocumento == '01' ? datos.nroDocumento : '',
      Codigo_interno: '',

      Nombre: tipoDocumento == '05' ? datos.nombreComercial
        : datos.nombres + ' ' + datos.apellidoP + ' ' + datos.apellidoM + ' ',

      Telefono1: datos.telefono,
      Fax: '',
      Correo: datos.email,
      Pais: paisSys,
      Departamento: datos.departamento,
      Ciudad: ciudad,
      Distrito: distrito,
      Vendedor: this.logins.objVendedor.ccod_vendedor,
      Zona1: datos.zona01,
      Situacion1: datos.situacion01,
      Lista_precios_determinado: datos.listaPrecio,
      Lista_detracciones_elegidos: '',
      Credito_mn: '',
      Credito_me: '',
      Percepcion: 'N',
      Percepcion_porcentaje: 0,
      Retencion: 'N',
      Retencion_porcentaje: 0,
      Buen_contribuyente: 'S',
      Excluye_percepcion: 'S',
      Direccion: datos.direccion,
      Rubro: '00',
      Listas_Precios: '',
      Lista_forma_pago_elegidos: '',
      Editar: 'S',
      Telefono2: '',
      Telefono3: '',
      Telefono4: '',
      Bonificacion: 'N',
      Nombre_comercial: datos.nombreComercial,
      Leyenda1: '',
      Leyenda2: '',
      Porcentaje_descuento: 0,
      Zona2: '00',
      Situacion2: '00',
      Gestor: '00',
      Estado: 'Activo',
      Nombres: tipoDocumento == '05' ? '' : datos.nombres,
      Apellido_paterno: tipoDocumento == '05' ? '' : datos.apellidoP,
      Apellido_materno: tipoDocumento == '05' ? '' : datos.apellidoM,
      Fecha_Trabajo: this.toolsService.fechaYHora(),
      Estado_contribuyente: '',
      Condicion: 'HABIDO',
      Copy_mail: '',
      Controlar_linea: 'N',
      Exonerado: 'N',
      Detraccion: ''
    }

  }


  //#endregion

}
