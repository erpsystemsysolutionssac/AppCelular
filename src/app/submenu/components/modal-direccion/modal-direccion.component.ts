import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSelect, ModalController } from '@ionic/angular';
import { ListaDespachosService } from 'src/app/service/despacho/lista-despachos.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
    selector: 'app-modal-direccion',
    templateUrl: './modal-direccion.component.html',
    styleUrls: ['./modal-direccion.component.scss'],
})
export class ModalDireccionComponent implements OnInit {

    // @ViewChild('filtroPuntoV') filtroPuntoV: IonSelect;
    // @ViewChild('filtroAlmacen') filtroAlmacen: IonSelect;
    // @ViewChild('filtroMoneda') filtroMoneda: IonSelect;

    @Input() direcciones;

    constructor(
        private fb: FormBuilder,
        private toolsService: ToolsService,
        private modalCtrl: ModalController) { }

    async ngOnInit() {
    }

    elegirDireccion(direccion: string){
        this.modalCtrl.dismiss({direccion});
    }
}
