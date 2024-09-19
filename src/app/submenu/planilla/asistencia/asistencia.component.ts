import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { ConfiguracionesService } from 'src/app/service/configuraciones/configuraciones.service';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { CencosService } from 'src/app/service/mantenimiento/cencos.service';
import { EmpleadosService } from 'src/app/service/mantenimiento/empleados.service';
import { AsistenciaService } from 'src/app/service/planilla/asistencia.service';
import { ToolsService } from 'src/app/service/tools.service';
import { Uid } from '@ionic-native/uid/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
// import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
// import { FingerprintAIO, FingerprintAIOOriginal } from '@ionic-native/fingerprint-aio';
import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
})
export class MarcarAsistenciaComponent implements OnInit {
    geoloc_posicion: string = '';
    geoloc_cencos: string = '';
    geoloc_marcar: string = '';
    ishidden: boolean = true;
    PosActual_hidden: boolean = true;
    PosCencos_hidden: boolean = true;
    isModalMonedaOpen = false;
    isModalTipoCambioOpen = false;
    _fechaEmision: string = '';
    ip: string;
    fpo_available: string = "";

    ifCargaPantalla: boolean = false;

    arrPuntoVenta: any[]= [];
    arrMotivoTramite: any[] = [];
    arrCencos: any[] = [];
    arrUnidadNegocio: any[] = [];
    arrOrdenTrabajo: any[] = [];
    arrResponsable: any[] = [];
    arrSolicitante: any[] = [];


    public formGeoLoc: FormGroup;

    @ViewChild(IonModal) modal: IonModal;
    @ViewChildren("cantidadProducto", { read: ElementRef }) private cantidadProducto: QueryList<ElementRef>;

    constructor(
        private uid: Uid,
        private androidPermissions: AndroidPermissions,
        // private fp: FingerprintAIO,
        private faio: FingerprintAIO,
        private form: FormBuilder,
        private loginService: LoginService,
        private globalService: GlobalService,
        private cencosService: CencosService,
        private empleadosService: EmpleadosService,
        private configuracionesService: ConfiguracionesService,
        private asistenciaService: AsistenciaService,
        private toolsService: ToolsService,
    ) { }

    async ngOnInit() {

        this.formGeoLoc = this.form.group({
            dni_persona: ['', [Validators.required]],
        })

        let idLoaing = await this.toolsService.mostrarCargando()

        this._fechaEmision = this.loginService.datosUsu.fecha_trabajo

        this.ifCargaPantalla = true;
        await this.toolsService.ocultarCargando(idLoaing)
        this.ip = await this.globalService.getPublicIP()
        if(this.loginService.codigo_empresa=="0000000001"){
            this.ishidden = false;
            this.showFingerprintAuth();
            // this.geoloc_posicion = "Buscando Latitud: ";
            // this.geoloc_imei ='Nro IMEI: ';
            // console.log("Iniciando")
            // this.showFingerprintAuth();
        }
    }

    async buscarAsistencia(){
        let dataAsistencia = {
            codigo_empresa: this.loginService.codigo_empresa,
            codigo_usuario: this.loginService.codigo_usuario
        }
        let idLoading: string = await this.toolsService.mostrarCargando('Buscando Datos')
        var datos_usuario;
        await this.asistenciaService.buscarAsistencia(dataAsistencia)
            .then(async (resp) => {
                datos_usuario=resp
            }).catch((err)=>{
                console.log(err)
            })
        
        await this.toolsService.ocultarCargando(idLoading)
        if(datos_usuario && datos_usuario.estado){
            const posicion = await this.posicion_usuario()
            
            const latitud = posicion.coords.latitude;
            const longitud = posicion.coords.longitude;
            const precision = posicion.coords.accuracy;
            
            const latitud_cencos = datos_usuario.coor_lat
            const longitud_cencos = datos_usuario.coor_lon
            const radio_cencos = datos_usuario.coor_radio

            if(latitud_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay latitud configurada en el centro de costos", 'error')
                return;
            }
            if(longitud_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay longitud configurada en el centro de costos", 'error')
                return;
            }
            if(radio_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay radio configurada en el centro de costos", 'error')
                return;
            }
            if(posicion){
                
                const distancia = this.redondear(this.getDistanciaMetros(latitud,longitud,latitud_cencos,longitud_cencos))
                
                this.geoloc_posicion = `Posición actual: ${latitud}, ${longitud}`;
                this.geoloc_cencos = 
                `${datos_usuario.cnom_cencos}
                    Posición del centro de costos: ${latitud_cencos}, ${longitud_cencos}
                    Radio de precisión: ${radio_cencos}`;
                if(distancia>radio_cencos){
                    this.geoloc_marcar = 
                    `Se encuentra a ${distancia} metros del centro de costos`
                    this.toolsService.mostrarAlerta(`Se encuentra a ${distancia-radio_cencos} metros del centro de costos`, 'error')
                }else{
                    this.geoloc_marcar = `Hora de ingreso registrada`
                    this.toolsService.mostrarAlerta(`Hora de ingreso registrada`, 'success', 4000)
                }
                
            }
        }else{
            this.toolsService.mostrarAlerta("No se pudo encontrar los datos", 'error')
        }
    }

    async posicion_usuario() {
        const coordinates = await Geolocation.getCurrentPosition();
        return coordinates;
    }

    getDistanciaMetros(lat1,lon1,lat2,lon2)
    {
        var rad = function(x) {return x*Math.PI/180;}
        var R = 6378.137; //Radio de la tierra en km
        var dLat = rad( lat2 - lat1 );
        var dLong = rad( lon2 - lon1 );
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) *
        Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        //aquí obtienes la distancia en metros por la conversion 1Km =1000m
        var d = R * c * 1000;
        return d ;
    }

    showFingerprintAuth() {
        this.faio.isAvailable()
          .then(available => {
            if (available) {
              this.faio.show({
                title: 'Lector de Huella',
                subtitle: 'Se requiere autentificación para registrar entrada',
                description: 'Esperando lector de huella para verificar identidad',
                fallbackButtonTitle: 'Use Backup',
                cancelButtonTitle: "Use Backup",
                disableBackup: false, // Disable backup to enforce biometric retry
              })
              .then(result => {
                    this.geoloc_marcar = 'Huella: Autentificación realizada'
                    this.buscarAsistencia()
                    console.log(result);
              })
              .catch(error => {
                    this.geoloc_marcar = 'Huella: Biometric authentication failed '+ error
                    console.log('Biometric authentication failed', error);
              });
            } else {
                this.geoloc_marcar = 'Huella: Biometric authentication is not available on this device.'
                // alert('Biometric authentication is not available on this device.');
            }
          })
          .catch(e => {
                this.geoloc_marcar = 'Huella: No se pudo activar el lector de huella'
                console.log(e);
                // alert('Authentication failed');
          });
    }

    showPosUsuario(){
        this.PosActual_hidden = !this.PosActual_hidden
    }
    showPosCencos(){
        this.PosCencos_hidden = !this.PosCencos_hidden
    }
    redondear(monto: number): number {
        return Math.round((monto + Number.EPSILON) * 100) / 100
    }
}
