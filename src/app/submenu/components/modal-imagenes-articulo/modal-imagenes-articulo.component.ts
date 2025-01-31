import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/core/components';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { Articulo } from 'src/app/interfaces/articulo';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { ToolsService } from 'src/app/service/tools.service';
import Swiper, { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-modal-imagenes-articulo',
  templateUrl: './modal-imagenes-articulo.component.html',
  styleUrls: ['./modal-imagenes-articulo.component.scss'],
})
export class ModalImagenesArticuloComponent implements OnInit {

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    // loop:true,
    pagination: { clickable: true, },
    autoHeight: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    zoom: { maxRatio: 10 }
  };

  sliederArr: any[] = [];
  imagenCambiar: any;
  imagenNombre: string;

  public imgCropear: any;
  public cropperLoading: boolean = true;
  private codigoArticulo: string = '';
  private actulizarListaArticulos: boolean = false;

  @Input() data: Articulo;

  constructor(
    private modalCtrl: ModalController,
    private toolsService: ToolsService,
    private sanitizer: DomSanitizer,
    private productoService: ProductoService
  ) { }

  @ViewChild('cropperModal') cropperModal: IonModal;
  @ViewChild('cropper') cropper: ImageCropperComponent;

  ngOnInit() {
    console.log(this.data);
    this.codigoArticulo = this.data.codigo;
    let ind = 1
    for (let [key, value] of Object.entries(this.data)) {
      if (key.includes('imagen')) {

        if (value == null) value = ''
        this.sliederArr.push({ nro: ind, src: value, change: false, blob: null, name: '', borrar: false, namePrev: value })
        ind++
      }
    }
  }

  cerrarImagenesModal() {
    return this.modalCtrl.dismiss({ actualizar: this.actulizarListaArticulos }, 'cancel');
  }

  async borrarImagen() {
    console.log(this.imagenCambiar);
    if (this.imagenCambiar.src == '') {
      return
    }
    let borrar: boolean;
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

  async cambiarGaleria() {
    const image = await Camera.getPhoto({
      quality: 25,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Escoger de la Galeria',
      promptLabelPicture: 'Tomar Foto',
      promptLabelHeader: 'Foto',
    });

    await this.cropperModal.present()
    let imageUrl = image.webPath;
    this.imagenNombre = new Date().getTime() + '.' + image.format
    this.imgCropear = imageUrl
    this.cropperLoading = true
  }

  async guardarImagen() {
    let idLoading = await this.toolsService.mostrarCargando()

    await this.subirImagenes().then(async (resp) => {
      console.log(resp);
      await this.toolsService.ocultarCargando(idLoading)
      if (resp.status) {
        this.toolsService.mostrarAlerta('Foto Editada')
      } else {
        this.toolsService.mostrarAlerta(resp.msg)
      }
      this.actulizarListaArticulos = true;
    })
  }

  onSwiper(swiper: Swiper) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
  onSlideChange([swiper]) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
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
    this.cropperLoading = true
    this.imgCropear = ''
    await this.cropperModal.dismiss();
  }

  async subirImagenes() {

    let cambiarImg: boolean = false
    let arrayImagenBody = { imgBase64: '', imgNombre: '', imgNombreAnterior: '', carpeta: 'articulos' };
    let arrayArtImagenBody = { imgNombre: '', codigoArticulo: '', fecha: '', usuario: '', ordenImagen: '' };

    for (const imagen of this.sliederArr) {
      if (imagen.change) {
        cambiarImg = true;
        const nombreOriginal = imagen.name;
        imagen.name = nombreOriginal.replace(/\.png$/, ".jpeg");

        const imgBase64 = await this.blobToBase64(imagen.blob);

        arrayImagenBody.imgBase64 = imgBase64.split(',')[1];
        arrayImagenBody.imgNombre = imagen.name;
        arrayImagenBody.imgNombreAnterior = imagen.namePrev;

        arrayArtImagenBody.imgNombre = imagen.name;
        arrayArtImagenBody.ordenImagen = imagen.nro;
      }
    }

    if (cambiarImg) {
      arrayArtImagenBody.codigoArticulo = this.codigoArticulo;
      arrayArtImagenBody.fecha = this.toolsService.fechaYHora();
      // console.log(arrayImagenBody, arrayArtImagenBody);
      
      const resp = await this.productoService.cambiarImagen(arrayImagenBody, this.toolsService.fechaYHora());
      if (!resp.status) {
        return resp;
      }

      return this.productoService.actualizarImagen(arrayArtImagenBody);
    } else {
      return new Promise((resolve) => { resolve('todo ok') })
    }
  }

  async blobToBase64(blob: Blob): Promise<string> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.readAsDataURL(blob); // Convierte a Base64
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  subirImagenesAntiguo() {
    const formImagenes: FormData = new FormData();
    let arrBorrar: any[] = []
    let cambiarImg: boolean = false
    let arrOrden: any[] = []
    let arrNombrePrev: any[] = []

    for (const imagen of this.sliederArr) {
      if (imagen.change) {
        cambiarImg = true;

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
      formImagenes.append('ccod_articulo', this.codigoArticulo);
      return this.productoService.cambiarImagen(formImagenes, this.toolsService.fechaYHora())
    }
    else {
      return new Promise((resolve) => { resolve('todo ok') })
    }
  }
}
