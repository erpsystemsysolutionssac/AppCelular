import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSelect, ModalController } from '@ionic/angular';
import { ListaDespachosService } from 'src/app/service/despacho/lista-despachos.service';
import { ToolsService } from 'src/app/service/tools.service';
import { ModalPedidoComponent } from '../modal-pedido/modal-pedido.component';

@Component({
    selector: 'app-lista-despachos',
    templateUrl: './lista-despachos.component.html',
    styleUrls: ['./lista-despachos.component.scss'],
})
export class ListaDespachosComponent implements OnInit {

    // @ViewChild('filtroPuntoV') filtroPuntoV: IonSelect;
    // @ViewChild('filtroAlmacen') filtroAlmacen: IonSelect;
    // @ViewChild('filtroMoneda') filtroMoneda: IonSelect;

    public fecha: any;
    public fechaBusqueda: string = this.toolsService.fechaHoy();
    public arrDespachos: any[] = [];
    public idLoading: string = '';

    public isAtendidos: boolean = false;

    constructor(
        private toolsService: ToolsService,
        private modalCtrl: ModalController,
        private listaDespachosService: ListaDespachosService) { }

    async ngOnInit() {
        await this.listaDespachos();

        this.listaDespachosService.eventFinalizarEntrega.subscribe(async data => {
            if (data) {
                await this.listaDespachos();
            }
        });
    }

    async listaDespachos() {
        this.idLoading = await this.toolsService.mostrarCargando('Cargando Despachos')
        this.arrDespachos = [];

        return new Promise((resolve) => {
            this.listaDespachosService.listaDespachos(this.fechaBusqueda, this.isAtendidos).subscribe(
                (resp) => {
              
                    this.arrDespachos.push(...resp);
                    resolve('acabo')

                    this.toolsService.ocultarCargando(this.idLoading);
                },
                (err) => {
                    console.log(err);
                }
            );
        })
    }

    setDate() {
        this.fechaBusqueda = this.toolsService.parsearFechaIso(this.fecha);
    }

    async eventoAbrirModal(documento) {
        const modal = await this.modalCtrl.create({
            component: ModalPedidoComponent,
            componentProps: {
                documento: documento
            }
        });

        await modal.present();
    }

    async ocultarAtendidos(event) {

        this.isAtendidos =  event.target.checked
        await this.listaDespachos();
    }

    async finalizarDespacho(despacho) {
        if (despacho.despacho_atencion == 'Atendido') {

        } else {
            await this.toolsService.confirmarAlerta('Hay despachos pendientes', 'warning').then((conf) => { console.log(conf) })
        }
    }
}
