import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { AgenciaTransporteService } from 'src/app/service/tomadorPedidos/agencia-transporte.service';
import { ToolsService } from 'src/app/service/tools.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-agencias-transportes',
    templateUrl: './agencias-transportes.component.html',
    styleUrls: ['./agencias-transportes.component.scss'],
})
export class AgenciasTransportesComponent implements OnInit {

    @ViewChild('elscroll') elscroll: CdkVirtualScrollViewport;

    public agenciaTransportesForm: FormGroup

    public arrAgenciasTransportes: any[] = []

    public buscarForm: FormGroup;
    public texto: string = '';
    public limite = environment.limiteArticulos
    public ionInfi = environment.limiteArticulos
    public estadoRecargar = true;
    public refreshDisabled: boolean = false

    private subscripcion: Subscription;

    constructor(
        private loginS: LoginService,
        private fb: FormBuilder,
        private globalS: GlobalService,
        private toolsService: ToolsService,
        private agenciaTransporteService: AgenciaTransporteService
    ) { }

    async ngOnInit() {
        this.buscarForm = this.fb.group({
            buscar: ['']
        });
        let idLoading = await this.toolsService.mostrarCargando('Cargando Articulos')

        await this.listaAgenciasTransportes('');

        setTimeout(() => {
            this.elscroll.scrollToIndex(0.1);
        }, 1);

        this.toolsService.ocultarCargando(idLoading);
        this.subscripcion = this.agenciaTransporteService.subject.subscribe(() => {
            this.arrAgenciasTransportes = []
            this.listaAgenciasTransportes('');
        })
    }

    async listaAgenciasTransportes(texto: string) {

        return new Promise((resolve) => {

            this.agenciaTransporteService.listaAgenciasTransportes(texto)
                .subscribe((resp) => {
                    if (resp.length < this.ionInfi) {
                        this.estadoRecargar = false
                    } else {
                        this.estadoRecargar = true
                    }

                    this.arrAgenciasTransportes.push(...resp)

                    resolve('acabo')
                }, (err) => {
                    console.log(err);
                })
        })
    }

    async buscarAgencias(form: FormGroup) {
        let inpBuscar = form.controls.buscar
        if (inpBuscar.pristine) return

        this.texto = inpBuscar.value;
        this.arrAgenciasTransportes = [];

        let idLoading = await this.toolsService.mostrarCargando()
        this.listaAgenciasTransportes(this.texto).then(async (resp) => {
            await this.toolsService.ocultarCargando(idLoading)
        })
    }

    @HostListener("window:scroll") onWindowScroll(event) {
        const top = event.srcElement.scrollTop
        if (top == 0) this.refreshDisabled = false
        else this.refreshDisabled = true
    }

}
