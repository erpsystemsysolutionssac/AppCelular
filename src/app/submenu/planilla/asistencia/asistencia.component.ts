import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationController, IonModal, IonSelect } from '@ionic/angular';
import { ConfiguracionesService } from 'src/app/service/configuraciones/configuraciones.service';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { CencosService } from 'src/app/service/mantenimiento/cencos.service';
import { EmpleadosService } from 'src/app/service/mantenimiento/empleados.service';
import { AsistenciaService } from 'src/app/service/planilla/asistencia.service';
import { ToolsService } from 'src/app/service/tools.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { Geolocation } from '@capacitor/geolocation';
import type { Animation } from '@ionic/angular';
import * as L from "leaflet";



@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
})
export class MarcarAsistenciaComponent implements OnInit {
    // geoloc_posicion: string = '';
    nrodoc_usuario: string = '';
    hora_asistencia: string = '';
    fecha_asistencia: string = '';
    texto_asistencia: string = '';
    hora_salida: string = '';
    fecha_salida: string = '';
    texto_salida: string = '';
    nombre_usuario: string = '';
    ishidden: boolean = true;
    MarcarAsistencia_hidden: boolean = false;
    Asistencia_hidden: boolean = true;
    Salida_hidden: boolean = true;
    PosActual_hidden: boolean = true;
    PosCencos_hidden: boolean = true;
    Opcional_hidden: boolean = true;
    Ubicacion_hidden: boolean = true;
    isModalPosicion: boolean = false;
    isModalConfirm: boolean = false;
    ActivarPosTReal: boolean = false;
    UbicacionPersonal: boolean = true;
    issetView: boolean = false;
    isModalMonedaOpen = false;
    isModalTipoCambioOpen = false;
    _fechaEmision: string = '';
    ip: string;
    fpo_available: string = "";
    datos_usuario: any = {}
    user_marker: any;
    cencos_marker: any;
    timeRepeat: number = 3000;
    leafletMap: any;

    
    jefe_data: any = []
    operario_data: any = []
    planilla_tareo: any = []



    // lat: number = 41.1533;

    // lng: number = 20.1683;
    
    zoom: number = 15;

    ifCargaPantalla: boolean = false;

    arrPuntoVenta: any[]= [];
    arrMotivoTramite: any[] = [];
    arrCencos: any[] = [];
    arrUnidadNegocio: any[] = [];
    arrOrdenTrabajo: any[] = [];
    arrResponsable: any[] = [];
    arrSolicitante: any[] = [];
    arrOT: any[] = [];

    listOfMarkers = [];
    markersEmpleados = [];

    private animationZoom: Animation;
    private animationShow: Animation;
    public formGeoLoc: FormGroup;
    
    @ViewChild('otSelect') otSelect: IonSelect;

    @ViewChild(IonModal) modal: IonModal;
    @ViewChildren("cantidadProducto", { read: ElementRef }) private cantidadProducto: QueryList<ElementRef>;
    @ViewChildren("marcar_asistencia", { read: ElementRef }) private marcar_asistencia: QueryList<ElementRef>;
    @ViewChildren("div_asistencia", { read: ElementRef }) private div_asistencia: QueryList<ElementRef>;
    
    
    constructor(
        private androidPermissions: AndroidPermissions,
        private faio: FingerprintAIO,
        private form: FormBuilder,
        private loginService: LoginService,
        private globalService: GlobalService,
        private cencosService: CencosService,
        private empleadosService: EmpleadosService,
        private configuracionesService: ConfiguracionesService,
        private asistenciaService: AsistenciaService,
        private toolsService: ToolsService,
        private animationCtrl: AnimationController,
        private router:Router,
    ) { }

    async ngOnInit() {

        this.formGeoLoc = this.form.group({
            dni_persona: ['', [Validators.required]],
        })

        this._fechaEmision = this.loginService.datosUsu.fecha_trabajo
        this.ifCargaPantalla = true;
        
        if(this.loginService.codigo_empresa=="0000000001"){
            this.ishidden = false;
            this.datos_usercencos()
        }
        this.ip = await this.globalService.getPublicIP()
            
        const enterAnimation = (baseEl: HTMLElement) => {
            const root = baseEl.shadowRoot;
    
            const backdropAnimation = this.animationCtrl
            .create()
            .addElement(root.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
    
            const wrapperAnimation = this.animationCtrl
            .create()
            .addElement(root.querySelector('.modal-wrapper'))
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' },
            ]);
    
            return this.animationCtrl
            .create()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
        };
    
        const leaveAnimation = (baseEl: HTMLElement) => {
            return enterAnimation(baseEl).direction('reverse');
        };
    
        this.modal.enterAnimation = enterAnimation;
        this.modal.leaveAnimation = leaveAnimation;

        const card = this.animationCtrl
        .create()
        .addElement(this.marcar_asistencia.get(0).nativeElement)
        .duration(800)
        // .beforeStyles({
        //     filter: 'invert(75%)',
        // })
        .beforeClearStyles(['box-shadow'])
        // .afterStyles({
        //     'box-shadow': 'rgba(255, 0, 50, 0.4) 0px 4px 16px 6px',
        // })
        .afterClearStyles(['filter'])
        .keyframes([
            { offset: 0, transform: 'scale(1)' },
            { offset: 0.5, transform: 'scale(1.1)' },
            { offset: 1, transform: 'scale(1)' },
        ]);

        this.animationZoom = this.animationCtrl.create().duration(800).addAnimation([card]);


        this.animationShow = this.animationCtrl
        .create()
        .addElement(this.div_asistencia.get(0).nativeElement)
        .fill('none')
        .duration(800)
        .keyframes([
            { offset: 0, transform: 'scale(1)', opacity: '0.5' },
            { offset: 0.5, transform: 'scale(0.8)', opacity: '1' },
            { offset: 1, transform: 'scale(1)', opacity: '0.5' },
        ]);

    }

    async btnmarcarAsistencia(){
       
        let idLoading: string = await this.toolsService.mostrarCargando('Buscando Datos')
        if(this.datos_usuario && this.datos_usuario.estado){
            const posicion = await this.posicion_usuario()
            
            if(posicion == null){
                await this.toolsService.ocultarCargando(idLoading)
                return;
            }
            const latitud = posicion.coords.latitude;
            const longitud = posicion.coords.longitude;
            const precision = posicion.coords.accuracy;
            
            const latitud_cencos = this.datos_usuario.coor_lat
            const longitud_cencos = this.datos_usuario.coor_lon
            const radio_cencos = this.datos_usuario.coor_radio

            if(latitud_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay latitud configurada en el centro de costos", 'error')
                await this.toolsService.ocultarCargando(idLoading)
                return;
            }
            if(longitud_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay longitud configurada en el centro de costos", 'error')
                await this.toolsService.ocultarCargando(idLoading)
                return;
            }
            if(radio_cencos==0 ){
                this.toolsService.mostrarAlerta("No hay radio configurada en el centro de costos", 'error')
                await this.toolsService.ocultarCargando(idLoading)
                return;
            }

            if(posicion){
                
                const distancia = this.redondear(this.getDistanciaMetros(latitud,longitud,latitud_cencos,longitud_cencos))
                
                if(distancia>radio_cencos){
                    this.toolsService.mostrarAlerta(`Se encuentra a ${this.redondear(distancia-radio_cencos)} metros del centro de costos`, 'error')
                }else{
                    // this.Opcional_hidden=true;
                    const fecha_hoy = this.toolsService.fechaHoy();
                    const hora_hoy = this.toolsService.horaActual();
                    let dataAsistencia = {
                        codigo_empresa: this.loginService.codigo_empresa,
                        fecha_trabajo: this.loginService.datosUsu.fecha_trabajo,
                        ccod_personal: this.datos_usuario.erp_codper,
                        ctipdoc_personal: this.datos_usuario.erp_codtid,
                        cnom_personal: this.datos_usuario.erp_nomper,
                        cape_personal: this.datos_usuario.erp_apepat + ' ' + this.datos_usuario.erp_apemat,
                        cnumdoc_personal: this.datos_usuario.erp_numtid,
                        fecha_asistencia: fecha_hoy,
                        hora_asistencia: hora_hoy,
                        tipo_asistencia: "Ingreso",
                        hora_pc:  new Date(),
                        ccod_user: this.loginService.codigo_usuario,
                        ccod_cencos: this.datos_usuario.ccod_cencos,
                        ccod_ot: this.datos_usuario.ccod_ot,
                    }
                    const respMarcarAsistencia = await this.asistenciaService.marcarAsistencia(dataAsistencia)
                    if(respMarcarAsistencia.estado){
                        this.MarcarAsistencia_hidden = true
                        this.Asistencia_hidden = false;
                        this.Salida_hidden = true;
                        this.fecha_asistencia = fecha_hoy;
                        this.hora_asistencia = hora_hoy;
                        this.texto_asistencia = `¡Hora de ingreso registrada!`
                        this.toolsService.mostrarAlerta(`Hora de ingreso registrada`, 'success', 4000)
                        this.animationShow.play();
                    }else{
                        this.toolsService.mostrarAlerta(respMarcarAsistencia.message, 'error', 4000)
                    }
                }
                
            }
        }else{
            this.toolsService.mostrarAlerta("No se pudo encontrar los datos", 'error')
        }
        await this.toolsService.ocultarCargando(idLoading)
    }

    async datos_usercencos(){
        console.log("user")
        let idLoaing = await this.toolsService.mostrarCargando()
        // let dataAsistencia = {
        //     codigo_empresa: this.loginService.codigo_empresa,
        //     codigo_usuario: this.loginService.codigo_usuario,
        //     fecha_trabajo: this.loginService.datosUsu.fecha_trabajo
        // }
        this.jefe_data = this.loginService.datosUsu.jefe_data
        this.operario_data = this.loginService.datosUsu.operario_data
        this.planilla_tareo = this.loginService.datosUsu.planilla_tareo
        
        if(this.jefe_data.length>0){
            console.log({jefe_data: this.jefe_data});
            this.jefe_data.forEach(element => {
                this.nombre_usuario = element.erp_nomper+ ' ' + element.erp_apepat + ' ' + element.erp_apemat 
                this.nrodoc_usuario = element.erp_nomtid+ ': ' + element.erp_numtid
                this.arrOT.push({
                    ccod_ot: element.ccod_ot,
                    cnom_ot: element.cnom_ot,
                    coor_lat: element.coor_lat,
                    coor_lon: element.coor_lon,
                    coor_radio: element.coor_radio,
                    erp_codper: element.erp_codper,
                })
            });
        }
        if(this.operario_data.length>0){
            console.log({operario_data: this.operario_data});
            this.operario_data.forEach(element => {
                this.nombre_usuario = element.erp_nomper+ ' ' + element.erp_apepat + ' ' + element.erp_apemat 
                this.nrodoc_usuario = element.erp_nomtid+ ': ' + element.erp_numtid
                this.arrOT.push({
                    ccod_ot: element.ccod_ot,
                    cnom_ot: element.cnom_ot,
                    coor_lat: element.coor_lat,
                    coor_lon: element.coor_lon,
                    coor_radio: element.coor_radio,
                    erp_codper: element.erp_codper,
                })
            });
        }

        
        console.log({arrOt: this.arrOT})
        
        setTimeout(() => {
            this.otSelect.open()
        }, 500);
        await this.toolsService.ocultarCargando(idLoaing)
    }

    async posicion_usuario() {
        try {
            const coordinates = await Geolocation.getCurrentPosition();
            return coordinates;
        } catch (err) {
            this.toolsService.mostrarAlerta("No se puede obtener la posición del usuario", 'error')
            // console.error('No se puede obtener la posición del usuario.', err);
            return null;
        }
        
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

    async showFingerprintAuth() {
        this.faio.isAvailable()
          .then(available => {
            if (available) {
              this.faio.show({
                title: 'REGISTRO DE ASISTENCIA',
                subtitle: '', //subtitle: 'Se requiere autentificación para registrar entrada',
                description: '', //description: 'Esperando lector de huella para verificar identidad',
                // fallbackButtonTitle: 'Más Opciones',
                // cancelButtonTitle: "Más Opciones",
                disableBackup: false, // Disable backup to enforce biometric retry
              })
              .then(result => {
                    this.toolsService.mostrarAlerta(`Buscando ubicación`, 'success', 4000)
                    this.btnmarcarAsistencia()
              })
              .catch(error => {
                    this.toolsService.mostrarAlerta(`Huella no autenticada`, 'error', 4000)
              });
            } else {
                this.toolsService.mostrarAlerta(`La autenticación biometrica esta desactivada`, 'error', 4000)
            }
          })
          .catch(e => {
            this.toolsService.mostrarAlerta(`No se puede activar el lector de huella`, 'error', 4000)
          });
          
        //   this.Opcional_hidden=false;
        //   await this.animationZoom.play();
        //   await this.animationZoom.play();
    }
    
    async envposTiempoReal(){
        this.toolsService.mostrarAlerta(`Enviando ubicación...`, 'success', 4000)
        this.ActivarPosTReal=true
        await this.enviarUbicacion();
    }
    
    
    async stopposTiempoReal(){
        this.toolsService.mostrarAlerta(`Deteniendo ubicación...`, 'success', 4000)
        let dataAsistencia = {
            codigo_empresa: this.loginService.codigo_empresa,
            codigo_usuario: this.loginService.codigo_usuario,
            ccod_ot: this.datos_usuario.ccod_ot,
        }
        await this.asistenciaService.eliminarPosicion(dataAsistencia)
        this.ActivarPosTReal=false
    }
    
    async verposTiempoReal(){
        this.issetView = false
        this.isModalPosicion = true
        setTimeout(() => {
            this.loadLeafletMap({mipos: true, cencos: true, empleados: true})
        }, 200);
    }
    
    verMiPosicion(){
        this.issetView = false
        this.isModalPosicion = true
        setTimeout(() => {
            this.loadLeafletMap({mipos: true, cencos: true, empleados: false})
        }, 200);
        
    }
    closeModalPosicion(){
        // this.modal.dismiss(null,'cancel')
        this.isModalPosicion = false

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
  
    popupHandler(url,index){
        var a = document.getElementById("pop_"+ index);
        a.addEventListener('click', ()=> {
            window.open(url, '_blank')
        });
    }
    
    async loadLeafletMap({mipos = true, cencos = true, empleados = false }) {
        this.leafletMap = new L.Map('leafletMap');
        const self = this;
        this.leafletMap.on("load", function () {
            setTimeout(() => {
                self.leafletMap.invalidateSize();
            }, 10);
        });
        this.leafletMap.setView([this.datos_usuario.coor_lat, this.datos_usuario.coor_lon], this.zoom);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href=”https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.leafletMap);
        if(mipos)
            this.loadMarkerUser()
        if(cencos)
            this.loadMarkerCencos()
        if(empleados)
            this.loadMarkerEmpleados()
    }

    async loadMarkerUser(){
        if(!this.isModalPosicion)
        {
            return;
        }
        const posicion = await this.posicion_usuario()
            
        if(posicion == null){
            return;
        }
        const latitud = posicion.coords.latitude;
        const longitud = posicion.coords.longitude;
        // this.toolsService.mostrarAlerta(`Buscando posicion: ${latitud}, ${longitud}`, 'success', 500)
        var index = 1
        if(this.leafletMap){
            this.listOfMarkers[1] = {
                lat: latitud,
                lng: longitud,
                // link: "https://medium.com/",
                icon: "marker-icon.png"
            }

            const markerData = this.listOfMarkers[index]
            let icon = L.icon({
                iconUrl: markerData.icon,
                iconSize: [30, 40]
            });
            if(this.user_marker){
                this.leafletMap.removeLayer(this.user_marker)
            }
            this.user_marker = L.marker([markerData.lat, markerData.lng],{icon: icon}).addTo(this.leafletMap)
            let popup = L.popup().setContent(`<div id="pop_${index}" style="font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: 10px; color: #3845b9">Yo</div>`);
            this.user_marker.bindPopup(popup);
            // this.user_marker.bindPopup(popup).on('click', () => {this.popupHandler(markerData.link, index)});
            if(this.issetView==false){
                this.leafletMap.setView([latitud, longitud], this.zoom);    
                this.issetView = true
            }
        }
        setTimeout(() => {
            this.loadMarkerUser()
        }, this.timeRepeat);
    }
    

    async loadMarkerCencos() {
        if(!this.isModalPosicion)
        {
            return;
        }
        const latitud = this.datos_usuario.coor_lat;
        const longitud = this.datos_usuario.coor_lon;
        // this.toolsService.mostrarAlerta(`Buscando posicion: ${latitud}, ${longitud}`, 'success', 500)
        const index = 1
        if(this.leafletMap){
            this.listOfMarkers[index] = {
                lat: latitud,
                lng: longitud,
                icon: "marker-icon.png"
            }

            const markerData = this.listOfMarkers[index]
            const circle = {
                color: '#5353ec',
                fillColor: '#5353ec',
                fillOpacity: 0.5,
                radius: this.datos_usuario.coor_radio
            }
            
            if(this.cencos_marker){
                this.leafletMap.removeLayer(this.cencos_marker)
            }
            this.cencos_marker = L.circle([markerData.lat, markerData.lng],circle).addTo(this.leafletMap)
            let popup = L.popup().setContent(`<div id="pop_${index}" style="font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: 12px; color: #3845b9">${this.datos_usuario.cnom_cencos}</div>`);
            this.cencos_marker.bindPopup(popup);
        }
    }

    async loadMarkerEmpleados(){
        if(!this.isModalPosicion)
        {
            return;
        }
        let dataAsistencia = {
            codigo_empresa: this.loginService.codigo_empresa,
            codigo_usuario: this.loginService.codigo_usuario,
            ccod_ot: this.datos_usuario.ccod_ot,
        }
        const listPosicion = await this.asistenciaService.obtenerPosicion(dataAsistencia)
        const listaPos = listPosicion.lista;
        var index = 1
        if(this.markersEmpleados.length>0){
            this.markersEmpleados.forEach( element => {
                this.leafletMap.removeLayer(element)
            });
            this.markersEmpleados = [];
        }
        listaPos.forEach((element) => {
            
            index++;
            var markerData = {
                lat: element.loc_lat,
                lng: element.loc_lon,
                icon: "marker-icon.png",
            }

            let icon = L.icon({
                iconUrl: 'https://erp-solutionsperu.com/img/marker1.png',
                iconSize: [25, 40]
            });
            let marker = L.marker([markerData.lat, markerData.lng],{icon: icon}).addTo(this.leafletMap)
            this.markersEmpleados.push(marker)
            let popup = L.popup().setContent(`<div id="pop_${index}" >${element.nom_user}</<div>`);
            marker.bindPopup(popup);
            // marker.bindPopup(popup).on('click', () => {this.popupHandler(markerData.link, index)});
        });
        setTimeout(() => {
            this.loadMarkerEmpleados()
        }, this.timeRepeat);
    }

    async enviarUbicacion(){
        if(!this.ActivarPosTReal){
            return;
        }
        const posicion = await this.posicion_usuario()
        if(posicion == null){
            return;
        }
        const latitud = posicion.coords.latitude;
        const longitud = posicion.coords.longitude;
        let dataAsistencia = {
            codigo_empresa: this.loginService.codigo_empresa,
            codigo_usuario: this.loginService.codigo_usuario,
            loc_lat: latitud,
            loc_lon: longitud,
            ccod_ot: this.datos_usuario.ccod_ot,
            cnom_ot: this.datos_usuario.cnom_ot,
            nom_user: this.datos_usuario.erp_nomper,
            ape_user: this.datos_usuario.erp_apepat + ' ' + this.datos_usuario.erp_apemat 
        }
        await this.asistenciaService.enviarPosicion(dataAsistencia)
        setTimeout(() => {
            this.enviarUbicacion()
        }, this.timeRepeat);
    }

    async btnmarcarSalida(){
        this.isModalConfirm = true
            
        this.toolsService.confirmarAlerta( '¿Esta seguro de marcar la Salida?','warning')
        .then(async (resp)=>{
            if (resp) {
                
                const fecha_hoy = this.toolsService.fechaHoy();
                const hora_hoy = this.toolsService.horaActual();
                let dataAsistencia = {
                    codigo_empresa: this.loginService.codigo_empresa,
                    fecha_trabajo: this.loginService.datosUsu.fecha_trabajo,
                    ccod_personal: this.datos_usuario.erp_codper,
                    ctipdoc_personal: this.datos_usuario.erp_codtid,
                    cnom_personal: this.datos_usuario.erp_nomper,
                    cape_personal: this.datos_usuario.erp_apepat + ' ' + this.datos_usuario.erp_apemat,
                    cnumdoc_personal: this.datos_usuario.erp_numtid,
                    fecha_asistencia: this.fecha_asistencia,
                    hora_asistencia: this.hora_asistencia,
                    fecha_salida: fecha_hoy,
                    hora_salida: hora_hoy,
                    tipo_asistencia: "Salida",
                    hora_pc:  new Date(),
                    ccod_user: this.loginService.codigo_usuario,
                    ccod_cencos: this.datos_usuario.ccod_cencos,
                    ccod_ot: this.datos_usuario.ccod_ot,
                }
                

                let idLoading = await this.toolsService.mostrarCargando('Registrando Salida')
                const respMarcarAsistencia = await this.asistenciaService.marcarAsistencia(dataAsistencia)
                
                if(respMarcarAsistencia.estado){
                    this.MarcarAsistencia_hidden = false
                    this.Asistencia_hidden=true;
                    this.Salida_hidden=false;
                    this.fecha_salida = fecha_hoy;
                    this.hora_salida = hora_hoy;
                    this.texto_salida = `¡Hora de Salida registrada!`
                    this.toolsService.mostrarAlerta(`Hora de Salida registrada`, 'success', 4000)
                    this.animationShow.play();
                }else{
                    this.toolsService.mostrarAlerta(respMarcarAsistencia.message, 'error', 4000)
                }
                await this.toolsService.ocultarCargando(idLoading)
            }
        })
    }
    
    async otSelectChange(){
        var ot_selected = this.arrOT.find((ele)=> ele.ccod_ot == this.otSelect.value)
        this.datos_usuario.coor_lat = ot_selected.coor_lat
        this.datos_usuario.coor_lon = ot_selected.coor_lon
        this.datos_usuario.coor_radio = ot_selected.coor_radio
        this.datos_usuario.ccod_ot = ot_selected.ccod_ot
        this.datos_usuario.ccod_ot = ot_selected.cnom_ot
        this.datos_usuario.estado = "N"
        var data_selected;
        if(this.jefe_data.length>0){
            var element = this.jefe_data.find((ele)=> ele.ccod_ot == this.otSelect.value)
            if(element){
                console.log("a")
                data_selected = element
                this.UbicacionPersonal = false
            }
            // this.jefe_data.forEach(element => {
            //     var selected = this.arrOT.find((ele)=> ele.ccod_ot == this.otSelect.value)
            // });
        }
        if(this.operario_data.length>0){
            var element = this.operario_data.find((ele)=> ele.ccod_ot == this.otSelect.value)
            if(element){
                console.log("b")
                data_selected = element
                this.UbicacionPersonal = true
            }
        }
        console.log({data_selected})
        this.datos_usuario.erp_codper = data_selected.erp_codper
        this.datos_usuario.erp_codtid = data_selected.erp_codtid
        this.datos_usuario.erp_nomper = data_selected.erp_nomper
        this.datos_usuario.erp_apepat = data_selected.erp_apepat
        this.datos_usuario.erp_apemat = data_selected.erp_apemat
        this.datos_usuario.erp_numtid = data_selected.erp_numtid
        this.datos_usuario.ccod_cencos = data_selected.ccod_cencos
        this.datos_usuario.cnom_cencos = data_selected.cnom_cencos
        this.datos_usuario.ccod_ot = data_selected.ccod_ot
        this.datos_usuario.cnom_ot = data_selected.cnom_ot

        console.log(this.planilla_tareo)

        let data = {
            codigo_empresa: this.loginService.codigo_empresa,
            fecha_trabajo: this.loginService.datosUsu.fecha_trabajo,
            codigo_usuario: this.loginService.codigo_usuario,
            ccod_ot: this.datos_usuario.ccod_ot
        }
        
        let idLoading = await this.toolsService.mostrarCargando('Buscando registros')
        const resbuscarTareo = await this.asistenciaService.buscarTareo(data)
        if(resbuscarTareo.estado){
            data_selected.tipo_asistencia = "N"
            const planilla_tareo = resbuscarTareo.planilla_tareo
            planilla_tareo.forEach(element => {
                data_selected.fecha_asistencia = element.fecha_asistencia
                data_selected.hora_asistencia = element.hora_asistencia
                data_selected.tipo_asistencia = element.tipo_asistencia
            });

            this.datos_usuario.estado = data_selected.tipo_asistencia
            switch(this.datos_usuario.estado){
                case "N":
                    this.MarcarAsistencia_hidden = false
                    this.Asistencia_hidden=true;
                    this.Salida_hidden=true;
                break;
                case "Ingreso":
                    this.MarcarAsistencia_hidden = true
                    this.Asistencia_hidden=false;
                    this.Salida_hidden=true;
                    this.fecha_asistencia = data_selected.fecha_asistencia;
                    this.hora_asistencia = data_selected.hora_asistencia;
                    this.texto_asistencia = `¡Hora de ingreso registrada!`
                    this.toolsService.mostrarAlerta(`Hora de ingreso registrada`, 'success', 4000)
                    this.animationShow.play();
                break;
                case "Salida":
                    this.MarcarAsistencia_hidden = false
                    this.Asistencia_hidden=true;
                    this.Salida_hidden=false;
                    this.fecha_salida = data_selected.fecha_salida;
                    this.hora_salida = data_selected.hora_salida;
                    this.texto_salida = `¡Hora de Salida registrada!`
                    this.toolsService.mostrarAlerta(`Hora de Salida registrada`, 'success', 4000)
                    this.animationShow.play();
                break;
            }
        }else{
            this.toolsService.mostrarAlerta(resbuscarTareo.message, 'error', 4000)
        }
        await this.toolsService.ocultarCargando(idLoading)
    }
}
