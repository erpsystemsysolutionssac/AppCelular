

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Camera, CameraResultType, CameraSource, Photo, } from '@capacitor/camera';
import { ToolsService } from 'src/app/service/tools.service';
import { IonModal, IonSelect } from '@ionic/angular';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { jsPDF } from "jspdf";
import { LoginService } from 'src/app/service/login.service';

import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import domtoimage from 'dom-to-image';
import { GuiaRemisionCabecera, GuiaRemisionDetalle } from 'src/app/interfaces/guia-remision';
import { GuiasRemisionService } from 'src/app/service/guias-remision/guias-remision.service';



@Component({
  selector: 'app-guia',
  templateUrl: './guia.component.html',
  styleUrls: ['./guia.component.scss'],
  providers: []
})
export class GuiaComponent implements OnInit {

  @ViewChild('pdfTable') pdfTable: ElementRef;
  @ViewChild('cropperModal') cropperModal: IonModal;
  @ViewChild('cropper') cropper: ImageCropperComponent;
  public imgCropear: any;
  public croppedImage: any = '';
  public cropperLoading: boolean = true;
  imagenNombre: string
  private textoBusqueda: string = '';

  public cnum_doc: string
  public motivo: string
  public guiaRemisionCabecera: GuiaRemisionCabecera = {}
  public guiaRemisionDetalle: GuiaRemisionDetalle[] = []
  public totalD: number = 0
  public totalIgv: number = 0
  public subtotal: number = 0
  public descuento: number = 0

  private rutaImages = this.toolS.obtenerUrl('urlImagenes');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private guiasRemisionService: GuiasRemisionService,
    private toolS: ToolsService,
    public loginS: LoginService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((param) => {

      this.cnum_doc = param.numeroDocumento
      this.motivo = param.motivo
      this.obtenerPedido(this.cnum_doc, this.motivo)
      this.guiaRemisionCabecera = this.guiasRemisionService.guiaRemisionCabecera

    })
  }


  async obtenerPedido(cnum_doc: string, motivo: string) {
    let idLoading = await this.toolS.mostrarCargando()
    this.guiasRemisionService.obtenerPedidoDetalle(cnum_doc, motivo).then(async (resp) => {
      this.guiaRemisionDetalle = []
      this.guiaRemisionDetalle.push(...resp)

      this.totalD = 0

      for (const guiaRemisionD of this.guiaRemisionDetalle) {
        this.totalIgv += guiaRemisionD.nigvcalc
        this.subtotal += guiaRemisionD.base_calculada
        this.totalD += guiaRemisionD.NPRECIO_IMPORTE
        this.totalD = this.toolS.redondear(this.totalD)
      }
      await this.toolS.ocultarCargando(idLoading)
    })

  }

  async upload() {


    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    const response = await fetch(image.webPath);
    const blob = await response.blob();
    var nombre_imagen = "voucher_pago." + image.format
    const formImagenes: FormData = new FormData();
    formImagenes.append('imagenes', blob, nombre_imagen);

    var archivosubido = await this.guiasRemisionService.subir_archivos(formImagenes, this.guiaRemisionCabecera.dfecha_doc.toString(), this.guiaRemisionCabecera.cnum_serie, this.guiaRemisionCabecera.cnum_doc);

    if (archivosubido.estado == true) {
      this.toolS.mostrarAlerta('Archivo subido', 'success');
    } else {
      this.toolS.mostrarAlerta('Ocurrió un error: ' + archivosubido.msg, 'error');
    }
  }

  async download() {
    var fecha = this.guiaRemisionCabecera.dfecha_doc.toString()
    var ejercicio = fecha.slice(0, 4)
    var periodo = fecha.slice(5, 7)
    window.open(`${this.rutaImages}/${this.loginS.ruc_empresa_usuario}/pedido/${ejercicio}/${periodo}/${this.guiaRemisionCabecera.cnum_serie}-${this.guiaRemisionCabecera.cnum_doc}-${this.guiaRemisionCabecera.ruta_pdf}`, "_blank")
  }

  async savePdf() {
    let pdfTable = this.pdfTable.nativeElement;
    var node = document.getElementById('pdfTable');
    let container = document.querySelector("#pdfTable");

    var nombre_img = this.guiaRemisionCabecera.cnum_serie+' - '+this.guiaRemisionCabecera.cnum_doc
    nombre_img = nombre_img + '.png'
    var img = new Image();
    var data_url;
    await domtoimage.toPng(container,
      {
        width: 750,
        height: 850
      }).then(function (dataUrl) {
        img.src = dataUrl;
        data_url = dataUrl

      })


    let uri: any
    await Filesystem.writeFile({
      path: nombre_img,
      data: data_url,
      directory: Directory.Cache
    }).then((resp) => {
      uri = resp.uri
    })
    await Share.share({
      title: nombre_img,
      text: "Guia Remision Nro: " + nombre_img,
      url: uri,
      dialogTitle: nombre_img,
    });



  }


}
