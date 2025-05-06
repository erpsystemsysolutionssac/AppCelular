import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { MarcadorService } from 'src/app/service/marcador/marcador.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-marcador',
  templateUrl: './marcador.component.html',
  styleUrls: ['./marcador.component.scss'],
})
export class MarcarMarcadorComponent implements OnInit {
    div_marcadorasistencia: boolean = true;
    setfocus_codigodoc: boolean = true;
    fecha_hora: string = "";
    hora_salida: string = '';
    fecha_salida: string = '';
    texto_salida: string = '';
    hora_marcador: string = '';
    fecha_marcador: string = '';
    texto_marcador: string = '';

    ip: string;
    ishidden: boolean = true;
    datos_usuario: any = {}

    public formMarcador: FormGroup;

    @ViewChildren("div_asistencia", { read: ElementRef }) private div_asistencia: QueryList<ElementRef>;
    @ViewChild('personaCodigoInput', { static: false }) personaCodigoInput: ElementRef;
    
    constructor(
        private form: FormBuilder,
        private loginService: LoginService,
        private globalService: GlobalService,
        private toolsService: ToolsService,
        private marcadorService: MarcadorService,
    ) { }

    async ngOnInit() {

        this.formMarcador = this.form.group({
            persona_codigo: ['', [Validators.required]],
        })
        if(this.loginService.codigo_empresa=="0000000001"){
            this.ishidden = false;
        }

        this.ip = await this.globalService.getPublicIP()

        this.set_fecha_hora();
        setInterval(() => {
            this.setFocusPersonaCodigo();
        }, 1000);
    }

    async btn_marcarentrada(){
        this.setfocus_codigodoc = false
        let idLoading: string = await this.toolsService.mostrarCargando('Buscando Datos')
        try{
            const fecha_hoy = this.toolsService.fechaHoy();
            const hora_hoy = this.toolsService.horaActual();
            let dataAsistencia = {
                codigo_empresa: this.loginService.codigo_empresa,
                fecha_trabajo: this.loginService.datosUsu.fecha_trabajo,
                ccod_personal: this.formMarcador.get("persona_codigo").value,
                fecha_asistencia: fecha_hoy,
                hora_asistencia: hora_hoy,
                tipo_asistencia: "Ingreso",
                hora_pc:  new Date(),
                ccod_user: this.loginService.codigo_usuario,
                ccod_cencos: "00",
                ccod_ot: "00",
                ctipdoc_personal: "",
                cnom_personal: "",
                cape_personal: "",
                cnumdoc_personal: "",
            }
            const respObtenerDatos = await this.marcadorService.obtenerDatos(dataAsistencia)
            const datos_persona = respObtenerDatos.personal[0]
            
            dataAsistencia.ctipdoc_personal = datos_persona.erp_codtid
            dataAsistencia.cnom_personal = datos_persona.erp_nomper
            dataAsistencia.cape_personal = datos_persona.erp_apepat + " " +datos_persona.erp_apemat
            dataAsistencia.cnumdoc_personal = datos_persona.erp_numtid
            const respMarcarAsistencia = await this.marcadorService.marcarAsistencia(dataAsistencia)
            if(respMarcarAsistencia.estado){
                this.div_marcadorasistencia = false
                this.toolsService.mostrarAlerta(`Hora de ingreso registrada`, 'success', 4000)
                this.texto_marcador = `¡Hora de ingreso registrada!`
                this.fecha_marcador = fecha_hoy;
                this.hora_marcador = hora_hoy;
                setTimeout(() => {
                    this.formMarcador.get("persona_codigo").setValue("")
                    this.div_marcadorasistencia = true
                    // this.personaCodigoInput.nativeElement.focus();
                }, 3000);
            }else{
                this.toolsService.mostrarAlerta(respMarcarAsistencia.message, 'error', 4000)
                setTimeout(() => {
                    this.formMarcador.get("persona_codigo").setValue("")
                    this.div_marcadorasistencia = true
                    // this.personaCodigoInput.nativeElement.focus();
                }, 1000);
            }
        }catch(e){
            this.toolsService.mostrarAlerta(e.message, 'error', 4000)
        }
        await this.toolsService.ocultarCargando(idLoading)
        this.setfocus_codigodoc = true
    }

    setFocusPersonaCodigo() {
        if (this.personaCodigoInput && this.setfocus_codigodoc) {
          this.personaCodigoInput.nativeElement.focus();
        }
    }

    onKeyDown_personacodigo(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.btn_marcarentrada();
        }
      }
    async set_fecha_hora(){
        const fecha_hoy = this.toolsService.fechaHoy();
        const hora_hoy = this.toolsService.horaActual();
        this.fecha_hora = fecha_hoy + " "+hora_hoy
        setTimeout(() => {
            this.set_fecha_hora()
         }, 1000);
    }
}
