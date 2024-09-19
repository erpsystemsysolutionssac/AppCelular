import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { Articulo } from 'src/app/interfaces/interfases';
import { ConfiguracionesService } from 'src/app/service/configuraciones/configuraciones.service';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { CencosService } from 'src/app/service/mantenimiento/cencos.service';
import { EmpleadosService } from 'src/app/service/mantenimiento/empleados.service';
import { MotivoTramiteService } from 'src/app/service/mantenimiento/motivo-tramite.service';
import { OrdenTrabajoService } from 'src/app/service/mantenimiento/orden-trabajo.service';
import { PuntoVentaService } from 'src/app/service/mantenimiento/punto-venta.service';
import { TipoCambioService } from 'src/app/service/mantenimiento/tipo-cambio.service';
import { UnidadNegocioService } from 'src/app/service/mantenimiento/unidad-negocio.service';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-generar-requerimiento',
  templateUrl: './generar-requerimiento.component.html',
  styleUrls: ['./generar-requerimiento.component.scss'],
})
export class GenerarRequerimientoComponent implements OnInit {
  selectedMoneda: string = 'S/';
  selectedTipoCambio: string = 'VTA';
  isMasIgv: string = 'S';
  isModalMonedaOpen = false;
  isModalTipoCambioOpen = false;
  _fechaEmision: string = '';
  ip: string;

  ifCargaPantalla: boolean = false;

  arrPuntoVenta: any[]= [];
  arrMotivoTramite: any[] = [];
  arrCencos: any[] = [];
  arrUnidadNegocio: any[] = [];
  arrOrdenTrabajo: any[] = [];
  arrResponsable: any[] = [];
  arrSolicitante: any[] = [];

  public arrDetalle: Articulo[] = []

  public formCabRequerimiento: FormGroup;

  @ViewChild(IonModal) modal: IonModal;
  @ViewChildren("cantidadProducto", { read: ElementRef }) private cantidadProducto: QueryList<ElementRef>;
  
  constructor(
    private form: FormBuilder,
    private loginService: LoginService,
    private globalService: GlobalService,
    private puntoVentaService: PuntoVentaService,
    private motivoTramiteService: MotivoTramiteService,
    private tipoCambioService: TipoCambioService,
    private cencosService: CencosService,
    private unidadNegocioService: UnidadNegocioService,
    private ordenTrabajoService: OrdenTrabajoService,
    private empleadosService: EmpleadosService,
    private configuracionesService: ConfiguracionesService,
    private requerimientoService: RequerimientoService,
    private toolsService: ToolsService,
  ) { }

  async ngOnInit() {

    this.formCabRequerimiento = this.form.group({
      codigoPuntoVenta: ['', [Validators.required]],
      codigoMotivo: ['', [Validators.required]],
      prioridad: ['M', [Validators.required]],
      fechaLimite: [this.loginService.datosUsu.fecha_trabajo_sistema, [Validators.required]],
      codigoCencos: ['', [Validators.required]],
      moneda: ['S/', [Validators.required]],
      tipoCambio: ['VTA', [Validators.required]],
      tasaCambio: ['', [Validators.required]],
      codigoUnidad: ['', [Validators.required]],
      codigoOt: ['', [Validators.required]],
      codigoResponsable: ['', [Validators.required]],
      codigoSolicitante: ['', [Validators.required]],
    })

    let idLoaing = await this.toolsService.mostrarCargando()
    await this.cargarConfiguraciones();
    await this.listarPuntoVenta('');
    await this.listaMotivoTramite();
    await this.consultarTipoCambio();
    await this.listarCencos();
    await this.listarUnidadNegocio();
    await this.listarOrdenTrabajo();
    await this.listarResponsable();
    await this.listarSolicitante();

    this.arrDetalle = this.requerimientoService.arrCarrito;
    this._fechaEmision = this.loginService.datosUsu.fecha_trabajo
    
    this.ifCargaPantalla = true;
    await this.toolsService.ocultarCargando(idLoaing)

    this.ip = await this.globalService.getPublicIP()
  }

  confirmar(event: any, campo: string){

    switch (campo) {
      case 'moneda':
        this.formCabRequerimiento.patchValue({moneda: event});
        this.modal.dismiss(null, 'confirm');
        this.setOpen(false, campo);
        break;
      case 'tipoCambio':
        this.formCabRequerimiento.patchValue({tipoCambio: event});
        this.modal.dismiss(null, 'confirm');
        this.setOpen(false, campo);
        this.consultarTipoCambio();
        break;
      case 'fecha':
 
        let _fecha = this.globalService.getShortDate(event.detail.value)
        this.formCabRequerimiento.patchValue({fechaLimite: _fecha});
        break;
      default:
        break;
    }
  }

  setOpen(isOpen: boolean, campo: string) {
    switch (campo) {
      case 'moneda':
        this.isModalMonedaOpen = isOpen;
      break;
      case 'tipoCambio':
        this.isModalTipoCambioOpen = isOpen;
        break;
    }
    
  }

  borrarArticulo(index: number) {
    this.toolsService.confirmarAlerta('Eliminar ' + this.arrDetalle[index].nombre).then((resp) => {

      if (resp) {
        this.arrDetalle.splice(index, 1)
      }

    })
  }

  sumarCantidad(cod: any) {
    let value: number
    let articulo = this.cantidadProducto.find((item) => {
      return item.nativeElement.id == cod
    })
    let articu = this.arrDetalle.find((articulo, i) => {
      return i == cod
    })
    value = articulo.nativeElement.value
    value++
    articu.cantidad = value

    articulo.nativeElement.value = value

  }

  restarCantidad(cod: any) {
    let value: number
    let articulo = this.cantidadProducto.find((item) => {
      return item.nativeElement.id == cod
    })
    let articu = this.arrDetalle.find((articulo, i) => {
      return i == cod
    })
    value = articulo.nativeElement.value
    if (value == 1) return
    value--
    articu.cantidad = value

    articulo.nativeElement.value = value
  }

  async borrarTodos(preguntar: boolean = false) {
    if (preguntar) {
      await this.toolsService.confirmarAlerta('Se limpiara el carrito', 'info')
        .then((resp) => {
          if (resp) {
            this.arrDetalle.splice(0, this.arrDetalle.length)
            this.formCabRequerimiento.patchValue({
              prioridad: 'M',
              fechaLimite: this.loginService.datosUsu.fecha_trabajo_sistema,
              codigoCencos: '00',
              moneda: 'S/',
              tipoCambio: 'VTA',
              codigoUnidad: '00',
              codigoOt: '00',
              codigoResponsable: this.arrResponsable[0].Codigo ,
              codigoSolicitante: '00',
            })
          }
        })
    } else {
      this.arrDetalle.splice(0, this.arrDetalle.length)
      this.formCabRequerimiento.patchValue({
        prioridad: 'M',
        fechaLimite: this.loginService.datosUsu.fecha_trabajo_sistema,
        codigoCencos: '00',
        moneda: 'S/',
        tipoCambio: 'VTA',
        codigoUnidad: '00',
        codigoOt: '00',
        codigoResponsable: this.arrResponsable[0].Codigo ,
        codigoSolicitante: '00',
      })
    }

  }

  async guardarRequerimiento(){
    //#region DATOS DEL REQUERIMIENTO
    let dataRequerimiento = {
      codigo_empresa: this.loginService.codigo_empresa,
      automatico: 'A',
      numero_correlativo: '0',
      motivo_documento: this.formCabRequerimiento.get('codigoMotivo').value,
      codigo_punto_venta: this.formCabRequerimiento.get('codigoPuntoVenta').value,
      anio: this.globalService.getYear(this.loginService.datosUsu.fecha_trabajo_sistema),
      fecha_doc: this.loginService.datosUsu.fecha_trabajo_sistema,
      fecha_limite: this.formCabRequerimiento.get('fechaLimite').value,
      prioridad: this.formCabRequerimiento.get('prioridad').value,
      estado: 'Ingresado',
      comentario: '',
      centro_costos: this.formCabRequerimiento.get('codigoCencos').value,
      fecha_aceptacion: '',
      observacion: '',
      orden_trabajo: this.formCabRequerimiento.get('codigoOt').value,
      unidad_negocio: this.formCabRequerimiento.get('codigoUnidad').value,
      usuario_aprobado1: '00',
      fecha_aprobacion2: '',
      observacion2: '',
      atencion: 'Pendiente',
      porcentaje: '0 %',
      moneda: this.formCabRequerimiento.get('moneda').value,
      tipo_cambio: this.formCabRequerimiento.get('tipoCambio').value,
      tasa_cambio: this.formCabRequerimiento.get('tasaCambio').value,
      glosa: '',
      codigo_agencia: '',
      codigo_usuario: this.loginService.codigo_usuario,
      tipo_referencia: '',
      numero_referencia: '',
      motivo_referencia: '',
      Pc_User: 'App-Movil',
      Pc_Fecha: '',
      Pc_Ip: this.ip,
      numero_exp: '',
      mas_igv: this.isMasIgv,
      erp_Dsubtotal: 0,
      erp_Ddescuento: 0,
      erp_Digv: 0,
      erp_Dimporte: 0,
      estado_salida: '',
      porcentaje_salida: '',
      responsable: this.formCabRequerimiento.get('codigoResponsable').value,
      subtotal_sin_descuentos: 0,
      numero_exp_2: '',
      nro_dias: this.globalService.restarFechas(this.formCabRequerimiento.get('fechaLimite').value, this.loginService.datosUsu.fecha_trabajo_sistema),
      usuario_areas: '',
      ruta_pdf: '',
      vendedor: '00',
      cod_solicitante: this.formCabRequerimiento.get('codigoSolicitante').value,
      filas_detalle: '',
      filas_comentarios: ''
    }

    let filas_detalle = [];
    this.arrDetalle.forEach(element => {
  
      let filaItem: any = {};
      filaItem.Codigo = element.codigo;
      filaItem.Nombre = element.nombre;
      filaItem.Cantidad = element.cantidad;
      filaItem.Cantidad_Kardex = (element.cantidad * element.factor);
      filaItem.Codigo_Unidad = element.cunidad;
      filaItem.Unit = 0;
      filaItem.Factor = element.factor;
      filaItem.Codigo_OT = dataRequerimiento.orden_trabajo;
      filaItem.Barticulo = 'S';
      filaItem.Codigo_Cencos = dataRequerimiento.centro_costos;
      filaItem.Codigo_Unidad_negocio = dataRequerimiento.unidad_negocio;
      filaItem.Codigo_Interno = '';
      filaItem.Cantidad_presentacion = element.cantidad;
      filaItem.Nombre_presentacion = element.nombre;
      filaItem.Unidad_presentacion = element.cunidad;
      filaItem.Precio_presentacion = 0;
      filaItem.Peso = element.peso;
      filaItem.Igv_Art = element.nigv;
      filaItem.Monto_Descuento = 0;
      filaItem.Base_Imponible = 0;
      filaItem.Igv = 0;
      filaItem.Importe = 0;
      filaItem.Codigo_presentacion = element.codigo;
      filaItem.Base_Calculada = 0;
      filas_detalle.push(filaItem);
    });

    dataRequerimiento.filas_detalle = JSON.stringify(filas_detalle);
    dataRequerimiento.filas_comentarios = JSON.stringify([]);
    //#endregion

    let idLoading: string = await this.toolsService.mostrarCargando('Creando Requerimiento')
    await this.requerimientoService.guardarRequerimiento(dataRequerimiento)
      .then(async (resp) => {
        await this.toolsService.ocultarCargando(idLoading)
        if (resp.estado) {
          this.toolsService.mostrarAlerta(`Requerimiento ${resp.codigo} Creado`, 'success', 4000)
          this.borrarTodos();
        }else {
          this.toolsService.mostrarAlerta(resp.mensaje, 'error')
        }
      })

  }

  async listarPuntoVenta(texto: string) {
    return new Promise((resolve) => {
      this.puntoVentaService.listaPuntoVenta(texto).subscribe((resp) => {
            this.arrPuntoVenta = resp;
            this.formCabRequerimiento.patchValue({codigoPuntoVenta: this.loginService.punto_venta});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listaMotivoTramite() {
    return new Promise((resolve) => {
      this.motivoTramiteService.listaMotivoTramite('REQ').subscribe((resp) => {
            this.arrMotivoTramite = resp;

            resp.forEach(element => {
              if (element.Predeterminado === 'S') {
                this.formCabRequerimiento.patchValue({codigoMotivo: element.Codigo});
              }
            });

            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async consultarTipoCambio() {
    const tipoCambio = this.formCabRequerimiento.get('tipoCambio').value;
    const fehca = this.loginService.datosUsu.fecha_trabajo_sistema;
    return new Promise((resolve) => {
      this.tipoCambioService.consultarTipoCambio(tipoCambio, fehca).subscribe((resp) => {
            this.formCabRequerimiento.patchValue({tasaCambio: resp});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listarCencos() {
    return new Promise((resolve) => {
      this.cencosService.listaCencosNivel3().subscribe((resp) => {
            this.arrCencos = resp;
            this.formCabRequerimiento.patchValue({codigoCencos: '00'});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listarUnidadNegocio() {
    return new Promise((resolve) => {
      this.unidadNegocioService.listaUnidadNegocio().subscribe((resp) => {
            this.arrUnidadNegocio = resp;
            this.formCabRequerimiento.patchValue({codigoUnidad: '00'});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listarOrdenTrabajo() {
    return new Promise((resolve) => {
      this.ordenTrabajoService.listaOrdenTrabajo().subscribe((resp) => {
            this.arrOrdenTrabajo = resp;
            this.formCabRequerimiento.patchValue({codigoOt: '00'});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listarResponsable() {
    return new Promise((resolve) => {
      this.empleadosService.listaResponsable().subscribe((resp) => {
            if (resp.length > 0) {
              this.arrResponsable = resp;
              this.formCabRequerimiento.patchValue({codigoResponsable: this.arrResponsable[0].Codigo});
            }
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async listarSolicitante() {
    return new Promise((resolve) => {
      this.empleadosService.listaSolicitante().subscribe((resp) => {
            this.arrSolicitante = resp;
            this.formCabRequerimiento.patchValue({codigoSolicitante: '00'});
            resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }

  async cargarConfiguraciones(){
    return new Promise((resolve) => {
      this.configuracionesService.configuracionesCompras().subscribe((resp) => {
          if (resp) {
            this.selectedMoneda = resp[0].moneda_trabajo;
            this.selectedTipoCambio = resp[0].ctipo_cambio;
            this.isMasIgv = resp[0].mas_igv;

            this.formCabRequerimiento.patchValue({moneda: this.selectedMoneda});
            this.formCabRequerimiento.patchValue({tipoCambio: this.selectedTipoCambio});
          }
          resolve('acabo')
        }, (err) => {
          this.toolsService.mostrarAlerta(err, 'error')
            console.log(err);
        })
    })
  }
}
