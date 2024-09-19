import { Component, OnInit, Renderer2, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Share, ShareOptions } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Requerimiento, RequerimientoDetallado } from 'src/app/interfaces/requerimiento.interface';
import { ConfiguracionesService } from 'src/app/service/configuraciones/configuraciones.service';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';
import { ToolsService } from 'src/app/service/tools.service';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-requerimiento',
  templateUrl: './modal-requerimiento.component.html',
  styleUrls: ['./modal-requerimiento.component.scss'],
})
export class ModalRequerimientoComponent implements OnInit, OnDestroy {

  requerimientoSeleccionado: Requerimiento;
  requerimiento: RequerimientoDetallado[] = [];
  numeroDoc: string = '';
  scriptUrl: string = '';

  private subscricion: Subscription = null

  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private requerimientoService: RequerimientoService,
    private toolsService: ToolsService,
    private configuracionesService: ConfiguracionesService,
    private globalService: GlobalService,
    private loginService: LoginService,
  ) { 
    this.requerimientoSeleccionado = this.requerimientoService.reqSeleccionado;
  }

  async ngOnInit() {
    this.route.params.subscribe(async (param)=>{

      (window as any).pagina_web_base = 'https://erp-solutionsperu.com';
      (window as any).codigo_empresa = this.loginService.codigo_empresa;
      (window as any).ruc_empresa = this.loginService.ruc_empresa_usuario;
      (window as any).modulo_impresion = 'otros';

      if (this.requerimientoSeleccionado) {
        this.numeroDoc = this.requerimientoSeleccionado.Numero;
        await this.consultarRequerimiento();
      }

    });
  }

  async consultarRequerimiento(cargar: boolean = true) {
    let idLoading: string
    if (cargar) idLoading = await this.toolsService.mostrarCargando('Cargando Requerimientos');

    await this.requerimientoService.consultarRequerimiento(this.requerimientoSeleccionado.Codigo_Motivo_Serie, this.requerimientoSeleccionado.Numero, this.requerimientoSeleccionado.Codigo_Punto_Venta).then(async(resp)=>{
      this.requerimiento = resp;
    });
    
    if (cargar) await this.toolsService.ocultarCargando(idLoading)
    await this.cargarScripts02();
    
  }

  async cargarScripts02(){
    const urls = [
      { url: 'https://erp-solutionsperu.com/js/formato_impresion/'+this.loginService.codigo_empresa+'/compras/requerimiento.js', ejecutar: false },
      { url: 'https://erp-solutionsperu.com/js/mantenimientos/formato_impresion_jspdf.js?v1', ejecutar: true }
    ]

    const promises = urls.map(({url, ejecutar}) => this.loadScript(url, ejecutar));
    await Promise.all(promises)
  }

  async loadScript(scriptUrl: string, ejecutar: boolean){
    
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
      let resp = await (window as any).crearPDF(this.requerimiento, 'requerimiento');

      if (resp.estado) {
        this.toolsService.mostrarAlerta(resp.mensaje, 'success', 4000)
      } else {
        this.toolsService.mostrarAlerta('Error Crear PDF: '+resp.mensaje, 'error', 4000)
      }
      await this.toolsService.ocultarCargando(idLoad)
    } else {
      this.toolsService.mostrarAlerta(`La función crearPDF no está definida en el script cargado.`, 'error', 4000);
      await this.toolsService.ocultarCargando(idLoad)
    }
  }

  async downloadAndSharePDF() {
    let idLoading: string
    idLoading = await this.toolsService.mostrarCargando('Descargando PDF');

    const nombreArchivo = (this.requerimiento[0].empresa_ruc + "-" + this.requerimiento[0].documento_tipo_movimiento + "-" + this.requerimiento[0].documento_motivo_venta_codigo + "-" + this.requerimiento[0].documento_numero);

    try {
      const pdfBlob = await this.configuracionesService.downloadPDF('requerimiento', nombreArchivo);

      this.toolsService.mostrarAlerta(`Consulta Pdf: ${pdfBlob.mensaje}`, 'success', 5000)

      const { uri } = await Filesystem.writeFile({
        path: nombreArchivo+'.pdf',
        data: ''+pdfBlob.dataBlob,
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

  async upload() {
    let idLoading: string
    

    let archivoSubido = {estado: true, msg: ''};
    const nombreArchivo = (this.requerimiento[0].documento_motivo_venta_codigo + "-" + this.requerimiento[0].documento_numero);

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });

    let filePath = image.webPath;
    idLoading = await this.toolsService.mostrarCargando('Subiendo archivo');

    await fetch(filePath).then(response => response.blob()).then(blob => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const nombre_imagen = nombreArchivo+"-voucher_pago."+image.format

        const repsonse = await this.configuracionesService.subirArchivos('requerimientos', nombre_imagen, base64data);
        archivoSubido = repsonse;

        if(archivoSubido.estado==true){
          await this.requerimientoService.actualizarArchivo(this.requerimiento[0].documento_numero, this.requerimiento[0].documento_motivo_venta_codigo, "voucher_pago."+image.format)
          await this.toolsService.ocultarCargando(idLoading)
          this.toolsService.mostrarAlerta('Archivo subido.', 'success');
        }else{
          await this.toolsService.ocultarCargando(idLoading)
          this.toolsService.mostrarAlerta('Ocurrió un error: '+archivoSubido.msg, 'error');
        }

      };
      reader.readAsDataURL(blob);
    }).catch(async (err) => {
      await this.toolsService.ocultarCargando(idLoading)
      console.error('Error al convertir imagen a base64:', err)
    });

  }

  cleanUpScripts() {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (this.scriptIsLoadedFromMyDomain(script.src)) {
        this.renderer.removeChild(document.body, script);
      }
    });
  }

  scriptIsLoadedFromMyDomain(src: string): boolean {
    return src.includes('erp-solutionsperu.com') || src.includes('code.jquery.com') || src.includes('cdnjs.cloudflare.com');
  }

  ngOnDestroy(): void {
    console.log('modal requerimiento destruido');
 
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
    this.cleanUpScripts();
  }
}