

import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PedidoCabecera } from 'src/app/interfaces/pedidoCabecera';
import { PedidoDetalle } from 'src/app/interfaces/pedidoDetalle';
import { Camera, CameraResultType, CameraSource, Photo, } from '@capacitor/camera';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { ToolsService } from 'src/app/service/tools.service';
import { IonModal, IonSelect } from '@ionic/angular';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { jsPDF } from "jspdf";
import { LoginService } from 'src/app/service/login.service';

import { Share, ShareOptions } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import domtoimage from 'dom-to-image';
import { PedidoDetallado } from 'src/app/interfaces/pedido.inteface';
import { ConfiguracionesService } from 'src/app/service/configuraciones/configuraciones.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
  providers: []
})
export class PedidoComponent implements OnInit {

  @ViewChild('pdfTable') pdfTable: ElementRef;
  @ViewChild('cropperModal') cropperModal: IonModal;
  @ViewChild('cropper') cropper: ImageCropperComponent;
  public imgCropear: any;
  public croppedImage: any = '';
  public cropperLoading: boolean = true;
  imagenNombre: string
  private textoBusqueda: string = '';

  public codigoPuntoVenta: string
  public cnum_doc: string
  public motivo: string
  public pedidoCabecera: PedidoCabecera = {}
  public pedidoDetalle: PedidoDetalle[] = []
  public totalD: number = 0
  public totalIgv: number = 0
  public subtotal: number = 0
  public descuento: number = 0

  pedidoDetallado: PedidoDetallado[] = [];

  private rutaImages = this.toolsService.obtenerUrl('urlImagenes');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private pedidosService: PedidosService,
    private configuracionesService: ConfiguracionesService,
    private toolsService: ToolsService,
    public loginService: LoginService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((param) => {

      (window as any).pagina_web_base = 'https://erp-solutionsperu.com';
      (window as any).codigo_empresa = this.loginService.codigo_empresa;
      (window as any).ruc_empresa = this.loginService.ruc_empresa_usuario;
      (window as any).modulo_impresion = 'otros';

      this.codigoPuntoVenta = param.puntoVenta;
      this.cnum_doc = param.cod;
      this.motivo = param.motivo;
      this.obtenerPedido(this.cnum_doc, this.motivo)
      this.pedidoCabecera = this.pedidosService.pedidoCabecera

      this.consultarPedido();
    })
  }

  async obtenerPedido(cnum_doc: string, motivo: string) {
    let idLoading = await this.toolsService.mostrarCargando()
    this.pedidosService.obtenerPedidoDetalle(cnum_doc, motivo).then(async (resp) => {
      this.pedidoDetalle = []
      this.pedidoDetalle.push(...resp)

      this.totalD = 0

      for (const pedidoD of this.pedidoDetalle) {
        this.totalIgv += pedidoD.nigv
        this.subtotal += pedidoD.base_calculada
        this.totalD += pedidoD.nimporte
        this.totalD = this.toolsService.redondear(this.totalD)
      }
      await this.toolsService.ocultarCargando(idLoading)
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
    // var nombre_imagen = this.pedidoCabecera.idmotivo_venta +"_"+this.pedidoCabecera.cnum_doc+"."+image.format
    var nombre_imagen = "voucher_pago." + image.format
    const formImagenes: FormData = new FormData();
    formImagenes.append('imagenes', blob, nombre_imagen);

    var archivosubido = await this.pedidosService.subir_archivos(formImagenes, this.pedidoCabecera.dfecha_doc.toString(), this.pedidoCabecera.idmotivo_venta, this.pedidoCabecera.cnum_doc);

    if (archivosubido.estado == true) {
      this.toolsService.mostrarAlerta('Archivo subido', 'success');
    } else {
      this.toolsService.mostrarAlerta('Ocurrió un error: ' + archivosubido.msg, 'error');
    }
  }

  async download() {
    var fecha = this.pedidoCabecera.dfecha_doc.toString()
    var ejercicio = fecha.slice(0, 4)
    var periodo = fecha.slice(5, 7)
    window.open(`${this.rutaImages}/${this.loginService.ruc_empresa_usuario}/pedido/${ejercicio}/${periodo}/${this.pedidoCabecera.idmotivo_venta}-${this.pedidoCabecera.cnum_doc}-${this.pedidoCabecera.ruta_pdf}`, "_blank")
    // window.open("https://erp-solutionsperu.com/erp/20600124782/pedido/2023/12/07-2023-00344-voucher_pago.png", "_blank");
  }

  async savePdf() {
    let pdfTable = this.pdfTable.nativeElement;
    var node = document.getElementById('pdfTable');
    let container = document.querySelector("#pdfTable");

    var nombre_img = this.pedidoCabecera.cnum_doc
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
      text: "Pedido Nro: " + nombre_img,
      url: uri,
      dialogTitle: nombre_img,
    });



  }

  async downloadAndSharePDF() {
    let idLoading: string
    idLoading = await this.toolsService.mostrarCargando('Descargando PDF');

    const pedidoD = this.pedidoDetallado[0];
    const nombreArchivo = this.pedidoDetallado[0].nombre_pdf;

    try {
      const pdfBlob = await this.configuracionesService.downloadPDF(pedidoD.empresa_ruc, pedidoD.documento_ejercicio, pedidoD.documento_periodo, pedidoD.carpeta_pdf, nombreArchivo);

      this.toolsService.mostrarAlerta(`Consulta Pdf: ${pdfBlob.mensaje}`, 'success', 5000)

      const { uri } = await Filesystem.writeFile({
        path: nombreArchivo + '.pdf',
        data: '' + pdfBlob.dataBlob,
        directory: Directory.Documents
      });

      this.toolsService.mostrarAlerta(`Ruta del pdf: ${uri}`, 'success', 5000)

      this.sharePDF(uri);

      await this.toolsService.ocultarCargando(idLoading)
    } catch (error) {

      await this.toolsService.ocultarCargando(idLoading)
      this.toolsService.mostrarAlerta(`Error al descargar el PDF: ${error}`, 'error', 4000)
    }
  }

  async sharePDF(pdfPath: string) {
    const shareOptions: ShareOptions = {
      title: 'Compartir PDF',
      url: pdfPath,
      dialogTitle: 'Compartir PDF'
    };

    await Share.share(shareOptions);
  }

  async consultarPedido(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Requerimientos');

    await this.pedidosService.consultarPedido(this.motivo, this.cnum_doc, this.codigoPuntoVenta).then(async (resp) => {
      this.pedidoDetallado = resp;
    });

    if (cargar) await this.toolsService.ocultarCargando(idLoading)
    await this.cargarScripts02();
  }

  async cargarScripts02() {
    const urls = [
      { url: 'https://erp-solutionsperu.com/js/formato_impresion/' + this.loginService.codigo_empresa + '/ventas/pedido.js?v1', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/js/mantenimientos/formato_impresion_jspdf.js?v4', ejecutar: true }
    ]

    const promises = urls.map(({ url, ejecutar }) => this.loadScript(url, ejecutar));
    await Promise.all(promises)
  }

  async loadScript(scriptUrl: string, ejecutar: boolean) {

    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');

      if (ejecutar) {
        script.onload = () => {
          console.log('Script cargado correctamente.')
          this.callDynamicFunction();
        }
      }

      this.renderer.setAttribute(script, 'src', scriptUrl);
      this.renderer.appendChild(document.body, script);
    });
  }

  async callDynamicFunction() {
    let idLoad: string
    idLoad = await this.toolsService.mostrarCargando('Generando PDF');

    if (typeof (window as any).crearPDF === 'function') {
      let resp = await (window as any).crearPDF(this.pedidoDetallado, 'requerimiento');
      console.log(resp);
      if (resp.status) {
        this.toolsService.mostrarAlerta(resp.msg, 'success', 4000)
      } else {
        this.toolsService.mostrarAlerta('Error Crear PDF: ' + resp.msg, 'error', 4000)
      }
      await this.toolsService.ocultarCargando(idLoad)
    } else {
      this.toolsService.mostrarAlerta(`La función crearPDF no está definida en el script cargado.`, 'error', 4000);
      await this.toolsService.ocultarCargando(idLoad)
    }
  }

}
