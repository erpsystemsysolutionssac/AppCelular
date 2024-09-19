import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSelect, ModalController } from '@ionic/angular';
import { ListaDespachosService } from 'src/app/service/despacho/lista-despachos.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
    selector: 'app-modal-pedido',
    templateUrl: './modal-pedido.component.html',
    styleUrls: ['./modal-pedido.component.scss'],
})
export class ModalPedidoComponent implements OnInit {

    // @ViewChild('filtroPuntoV') filtroPuntoV: IonSelect;
    // @ViewChild('filtroAlmacen') filtroAlmacen: IonSelect;
    // @ViewChild('filtroMoneda') filtroMoneda: IonSelect;
    public idLoading: string = ''; 
    public arrDetalleDocumentos: any[] = [];

    @Input() documento;

    constructor(
        private fb: FormBuilder,
        private toolsService: ToolsService,
        private modalCtrl: ModalController,
        private listaDespachosService: ListaDespachosService) { }

    async ngOnInit() {
        this.listaDetalleDespachos(this.documento);
    }

    async listaDetalleDespachos(documento: any){
        this.idLoading = await this.toolsService.mostrarCargando('Cargando Documento')
        this.arrDetalleDocumentos = [];
        
        return new Promise((resolve) => {
            this.listaDespachosService.listaDetalleDocumentoDespachos(documento.documento_desp_punto_venta, documento.documento_desp_motivo, documento.documento_desp_numero, documento.documento_motivo, documento.documento_serie, documento.documento_numero).subscribe(
                (resp) => {
                    this.arrDetalleDocumentos.push(...resp);
                    resolve('acabo')

                    this.toolsService.ocultarCargando(this.idLoading);
                },
                (err) => {
                    console.log(err);
                }
            );
        })
    }

    seleccionarCard(arrayDetalleDocumento, index){
        for (let i = 0; i < arrayDetalleDocumento.length; i++) {
            const element = arrayDetalleDocumento[i];
            if (index === i) {
                if (this.arrDetalleDocumentos[i].detalle_selected) {
                    this.arrDetalleDocumentos[i].detalle_selected = false;
                } else {
                    this.arrDetalleDocumentos[i].detalle_selected = true;
                }
            }
          }
    }

    async entregarPedido(){

        this.idLoading = await this.toolsService.mostrarCargando('Entregando Pedido')

        return new Promise((resolve) => {
            this.listaDespachosService.entregarPedido(this.arrDetalleDocumentos).subscribe(
                (resp) => {
                    resolve('acabo')

                    this.toolsService.ocultarCargando(this.idLoading);
                    this.modalCtrl.dismiss(null, 'cancel');
                    this.listaDespachosService.eventFinalizarEntrega.next(true);
                },
                (err) => {
                    console.log(err);
                }
            );
        })
    }

    close() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

}
