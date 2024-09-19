

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PedidoCabecera } from 'src/app/interfaces/pedidoCabecera';
import { PedidoDetalle } from 'src/app/interfaces/pedidoDetalle';
import {Camera,CameraResultType,CameraSource,Photo,} from '@capacitor/camera';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { ToolsService } from 'src/app/service/tools.service';
import { IonModal, IonSelect } from '@ionic/angular';
import { ImageCropperComponent } from 'ngx-image-cropper';

import { jsPDF } from "jspdf";
import { LoginService } from 'src/app/service/login.service';

import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import domtoimage from 'dom-to-image';



@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
  providers:[]
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

  public cnum_doc:string
  public motivo: string
  public pedidoCabecera:PedidoCabecera ={}
  public pedidoDetalle:PedidoDetalle[] =[]
  public totalD:number = 0
  public totalIgv:number =0
  public subtotal:number=0
  public descuento:number=0

  private rutaImages = this.toolS.obtenerUrl('urlImagenes');

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private pedidoS:PedidosService,
    private toolS:ToolsService,
    public loginS:LoginService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((param)=>{
   
      this.cnum_doc = param.cod
      this.motivo = param.motivo
      this.obtenerPedido(this.cnum_doc, this.motivo)
      this.pedidoCabecera = this.pedidoS.pedidoCabecera

    })
  }


  async obtenerPedido(cnum_doc:string, motivo: string){
    let idLoading = await this.toolS.mostrarCargando()
    this.pedidoS.obtenerPedidoDetalle(cnum_doc, motivo).then(async(resp)=>{
      this.pedidoDetalle =[]
      this.pedidoDetalle.push(...resp)

      this.totalD = 0

      for (const pedidoD of this.pedidoDetalle) {
        this.totalIgv += pedidoD.nigv 
        this.subtotal += pedidoD.base_calculada
        this.totalD +=pedidoD.nimporte
        this.totalD =this.toolS.redondear(this.totalD) 
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
    // var nombre_imagen = this.pedidoCabecera.idmotivo_venta +"_"+this.pedidoCabecera.cnum_doc+"."+image.format
    var nombre_imagen = "voucher_pago."+image.format
    const formImagenes: FormData = new FormData();
    formImagenes.append('imagenes', blob, nombre_imagen);

    var archivosubido = await this.pedidoS.subir_archivos(formImagenes,this.pedidoCabecera.dfecha_doc.toString(),this.pedidoCabecera.idmotivo_venta,this.pedidoCabecera.cnum_doc);

    if(archivosubido.estado == true){
      this.toolS.mostrarAlerta('Archivo subido', 'success');
    }else{
      this.toolS.mostrarAlerta('Ocurrió un error: '+archivosubido.msg, 'error');
    }
  }

  async download(){
    var fecha = this.pedidoCabecera.dfecha_doc.toString()
    var ejercicio = fecha.slice(0,4)
    var periodo = fecha.slice(5,7)
    window.open(`${this.rutaImages}/${this.loginS.ruc_empresa_usuario}/pedido/${ejercicio}/${periodo}/${this.pedidoCabecera.idmotivo_venta}-${this.pedidoCabecera.cnum_doc}-${this.pedidoCabecera.ruta_pdf}`, "_blank")
    // window.open("https://erp-solutionsperu.com/erp/20600124782/pedido/2023/12/07-2023-00344-voucher_pago.png", "_blank");
  }

  async savePdf() {
    let pdfTable = this.pdfTable.nativeElement;
    var node = document.getElementById('pdfTable');
    let container = document.querySelector("#pdfTable");

    var nombre_img = this.pedidoCabecera.cnum_doc 
    nombre_img = nombre_img+'.png'
    var img = new Image();
    var data_url;
    await domtoimage.toPng(container,
      {
        width: 750,
        height: 850
      }).then( function(dataUrl) {
      img.src = dataUrl;
      data_url = dataUrl
      
    })
    
    
    let uri:any
    await Filesystem.writeFile({
      path: nombre_img,
      data: data_url,
      directory: Directory.Cache
    }).then((resp)=>{
      uri=resp.uri
    })
    await Share.share({
      title: nombre_img,
      text: "Pedido Nro: "+nombre_img,
      url: uri,
      dialogTitle: nombre_img,
    });



  }


}
