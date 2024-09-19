import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalService } from 'src/app/service/global.service';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-modal-promociones',
  templateUrl: './modal-promociones.component.html',
  styleUrls: ['./modal-promociones.component.scss'],
})
export class ModalPromocionesComponent implements OnInit {

  public arrayBonificaciones: any[];

  @Input() documento;

  constructor(
    private modalCtrl: ModalController,
    private articuloService: ArticuloService,
    private toolsService: ToolsService,
    private globalService: GlobalService
  ) { }

  ngOnInit() {
    this.listaBonificaciones(this.documento);
  }

  async listaBonificaciones(articulo: any) {
    let idLoading = await this.toolsService.mostrarCargando('Cargando Promociones')
    await this.articuloService.listaBonificaciones(articulo, this.globalService.getDateOfNewDate())
      .then((resp: []) => {
        this.arrayBonificaciones = resp;
        this.toolsService.ocultarCargando(idLoading)
      }).catch( (err) => {
        console.log(err)
      })
  }

  close() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
