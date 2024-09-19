import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';
import { ToolsService } from 'src/app/service/tools.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonInput, IonModal } from '@ionic/angular';
import { find } from 'rxjs/operators';

import SwiperCore, {
  SwiperOptions,
  Navigation,
  Pagination,
  A11y,
} from 'swiper';
SwiperCore.use([Navigation, Pagination, A11y]);

@Component({
  selector: 'app-articulo',
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.scss'],
  // encapsulation:ViewEncapsulation.None
})
export class ArticuloComponent implements OnInit {
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true },
  };

  sliederArr = [
    { nro: 1, src: '' },
    { nro: 2, src: '' },
    { nro: 3, src: '' },
    { nro: 4, src: '' },
  ];

  imagenCambiar: any;

  modalImagenes = false;
  modalFicha = false;

  public articulo: any;
  public src: any = './../../../assets/default.svg';

  public ccod_articulo: string;
  private infoImange: any;
  public cargando = true;
  private nombreImagen: string;

  carritoForm: FormGroup;

  constructor(
    private loginService: LoginService,
    private articuloService: ArticuloService,
    private toolsService: ToolsService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    
  }

  async ngOnInit() {
    this.carritoForm = this.fb.group({
      cantidad: [''],
    });
    let idLoading = await this.toolsService.mostrarCargando('Cargando');
    this.ccod_articulo = this.route.snapshot.paramMap.get('cod');
    this.articuloService
      .buscarArticulo(
        this.loginService.codigo_empresa,
        this.ccod_articulo,
        this.loginService.punto_venta
      )
      .subscribe(async (resp) => {
        this.articulo = resp[0];
        this.cargando = false;
        await this.toolsService.ocultarCargando(idLoading);
        this.nombreImagen = this.articulo.ruta_imagen;
      });
  }

  async cambiarImagen() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    let imageUrl = image.webPath;

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    this.articulo.imagen = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

    this.nombreImagen = new Date().getTime() + '.' + image.format;
    this.infoImange = { nombreImagen: this.nombreImagen, blob };
  }

  async cambiarGaleria() {

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    let imageUrl = image.webPath;

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    this.imagenCambiar.src = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

    if (this.imagenCambiar.nro == 1) {
      this.articulo.imagen = this.imagenCambiar.src;
    }
  }

  async borrarImagen() {
    if (this.imagenCambiar.src == '') {
      return;
    }
    let borrar: boolean;
    await this.toolsService
      .confirmarAlerta('Se borrara la imagen', 'warning')
      .then((resp) => {
        borrar = resp;
      });
    if (borrar) {
      this.imagenCambiar.src = '';
    }
  }

  async guardar() {

    this.toolsService.mostrarAlerta('Articulo Actualizado', 'success');

    this.router.navigate(['catalogo/articulos']).then(() => {
      this.articuloService.refrescar();
    });

  }


  agregarCarrito(cantidad: IonInput) {
    let stock: number = this.articulo.Stock;
    let cant = parseInt(cantidad.value.toString());

    if (isNaN(cant)) {
      this.toolsService.mostrarAlerta(`Ingrese una cantidad`, 'error');
      return;
    }
    if (cant < 0) {
      this.toolsService.mostrarAlerta(
        `${cant} no es una cantidad valida`,
        'error'
      );
      return;
    }
    if (cant > stock) {
      this.toolsService.mostrarAlerta(
        `${cant} supera el stock actual`,
        'error'
      );
      return;
    }
  }

  onSwiper(swiper) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1;
    });
  }
  onSlideChange([swiper]) {
    this.imagenCambiar = this.sliederArr.find((img) => {
      return img.nro == swiper.activeIndex + 1;
    });
  }

  estadoModalImagenes(estado: boolean) {
    this.modalImagenes = estado;
  }

  estadoModalFicha(estado: boolean) {
    this.modalFicha = estado;
  }
}
