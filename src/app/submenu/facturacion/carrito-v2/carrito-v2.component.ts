import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { element } from 'protractor';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { FormaPago, Vendedor, filtroListaPrecio } from 'src/app/interfaces/interfases';
import { LoginService } from 'src/app/service/login.service';
import { clienteService } from 'src/app/service/mantenimiento/cliente.service';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { PromocionesService } from 'src/app/service/tomadorPedidos/promociones.service';
import { ToolsService } from 'src/app/service/tools.service';
import { ModalDireccionComponent } from '../../components/modal-direccion/modal-direccion.component';
import { ModalPromocionesComponent } from '../../components/modal-promociones/modal-promociones.component';
import { PuntoVentaService } from 'src/app/service/mantenimiento/punto-venta.service';
import { UbigeoService } from 'src/app/service/mantenimiento/ubigeo.service';
import { VehiculoService } from 'src/app/service/mantenimiento/vehiculo.service';
import { ChoferService } from 'src/app/service/mantenimiento/chofer.service';
import { Cliente } from 'src/app/interfaces/cliente';
import { FacturacionService } from 'src/app/service/facturacion/facturacion.service';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { GuiasRemisionService } from 'src/app/service/guias-remision/guias-remision.service';
import { TalonariosService } from 'src/app/service/mantenimiento/talonarios.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito-v2.component.html',
  styleUrls: ['./carrito-v2.component.scss'],
})
export class CarritoV2Component implements OnInit {

  @ViewChildren("listaCantidadCarrito", { read: ElementRef }) private listaCantidadCarrito: QueryList<ElementRef>;
  @ViewChild('fecha', { read: ElementRef }) fecha: ElementRef<HTMLElement>;

  public arrayCarrito: DetalleVenta[] = []

  public arrfiltroListaPrecio: filtroListaPrecio[] = []
  public objCliente: Cliente = {}

  public arrTipoDocumento: any[] = []
  public arrTalonario: any[] = []
  public arrTalonar: any[] = []
  public objVendedor: Vendedor = {}
  public arrUbigeos: any[] = [];
  public arrVehiculos: any[] = [];
  public arrChoferes: any[] = [];

  public facturaForm: FormGroup
  public tipoCambio: number

  private ip: string
  private objFormaPago: FormaPago = {}
  public isSelecArticulo: boolean = false;

  private edicionCampo: boolean = false;
  public docPendSeleccionado: any;

  public ubigeoOpen: boolean = false;

  public websocket;

  constructor(
    private clienteService: clienteService,
    private router: Router,
    private route: ActivatedRoute,
    public carritoService: CarritoService,
    private toolsService: ToolsService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private productoService: ProductoService,
    private promoS: PromocionesService,
    private modalCtrl: ModalController,
    private puntoVentaService: PuntoVentaService,
    private ubigeoService: UbigeoService,
    private vehiculoSevice: VehiculoService,
    private choferService: ChoferService,
    private facturacionService: FacturacionService,
    private pedidosService: PedidosService,
    private guiasRemisionService: GuiasRemisionService,
    private talonariosService: TalonariosService
  ) {

  }

  async ngOnInit() {
    let idLoaing = await this.toolsService.mostrarCargando()
    this.facturaForm = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      serie:['',[Validators.required]],
      puntoPartida: ['', [Validators.required]],
      ubigeoPartida: ['', [Validators.required]],
      direcciones: ['', [Validators.required]],
      ubigeoLlegada: ['', [Validators.required]],
      agencias: ['00'],
      formaPago: ['', [Validators.required]],
      vehiculo: ['00'],
      chofer: ['00'],
      fechaEntrega: [this.toolsService.fechaYHoraIso(), [Validators.required]],
      glosa: ['']
    })
    this.arrayCarrito = this.carritoService.arrayCarrito;
    this.arrfiltroListaPrecio = this.carritoService.arrfiltroListaPrecio
    this.objCliente = this.carritoService.objCliente

    this.objVendedor = this.loginService.objVendedor
    await this.listarTipoDocuYTalo();
    await this.listaUbigeos();
    await this.datosPuntoVenta();
    this.listaChoferes();
    this.listaVehiculos();
    await this.toolsService.ocultarCargando(idLoaing)

    this.route.params.subscribe(async (param) => {
      if (this.carritoService.documentoPendienteSeleccionado && this.carritoService.documentoPendienteSeleccionado != '') {
        this.docPendSeleccionado = this.carritoService.documentoPendienteSeleccionado;
        this.cargarDocumentoPendiente(this.carritoService.documentoPendienteSeleccionado);
      }
    });
  }

  get clienteExiste() {

    if (Object.keys(this.objCliente).length == 0) {
      return false
    } else {
      if (!this.edicionCampo) {
        this.facturaForm.patchValue({
          direcciones: this.objCliente.cdireccion,
        })
      }
      return true
    }
  }

  async listarTipoDocuYTalo() {
    await Promise.all([
      this.carritoService.listaTipoDocumento(),
      this.talonariosService.listaTalonarios('03'),
      this.carritoService.getPublicIP(),
    ]).then((resp: any) => {
      if (resp.estado) console.log(resp.msg);

      this.arrTipoDocumento.push(...resp[0])
      this.arrTalonario = resp[1];

      this.facturaForm.patchValue({tipoDocumento: '03', serie: this.arrTalonario[0].cnum_serie})
      this.ip = resp[2]
    }).catch((err) => { console.log(err); })

  }

  cambiarTalonar(e: any) {
    let value = e.detail.value
    this.arrTalonar = this.arrTalonario.filter((talonario) => talonario.tip_doc == value)
  }

  async changeTipoDocumento(){
    let codigoTipoDocumento = this.facturaForm.get('tipoDocumento').value;
    if(codigoTipoDocumento != ''){
      let data = await this.talonariosService.listaTalonarios(codigoTipoDocumento);
      this.arrTalonario = data;
      this.facturaForm.patchValue({serie: this.arrTalonario[0].cnum_serie})
    }
  }

  formaPagoChange() {
    let codigoFormaPago = this.facturaForm.get('formaPago').value;
    let formaPago = this.carritoService.arrFormasPago.find((formaPago) => formaPago.ccod_forpago === codigoFormaPago);
    this.objFormaPago = formaPago;
  }

  seleccionarCliente() {
    this.edicionCampo = false;
    this.isSelecArticulo = this.arrayCarrito.length == 0 ? false : true;

    this.clienteService.clientesOn = true
    this.clienteService.refresh()
    this.router.navigate(['../clientes'], { relativeTo: this.route })
  }

  seleccionarArticulo() {
    this.isSelecArticulo = true;
    this.productoService.refrescar();
    this.productoService.setListaPrecioCliente(this.objCliente.lista_precios);

    this.productoService.eventSeleccionArticulo.next(true);
    this.router.navigate(['../articulos'], { relativeTo: this.route })

  }

  sumarCantidad(detalleVenta: DetalleVenta) {
    detalleVenta.Cantidad += 1;
  }

  restarCantidad(detalleVenta: DetalleVenta) {
    if (detalleVenta.Cantidad > 0) {
      detalleVenta.Cantidad -= 1;
    }
  }

  valorInput(detalleVenta: DetalleVenta) {
    if (isNaN(detalleVenta.Cantidad) || detalleVenta.Cantidad <= 0) {
      detalleVenta.Cantidad = 1;
    }

    this.carritoService.calcularDetalleVenta();
  }

  valorPromocion(event: any, detalleVenta: DetalleVenta) {
    detalleVenta.check_bonificacion = (event.detail).checked;
    if (detalleVenta.check_bonificacion) {
      detalleVenta.Desc2 = 100;
    } else {
      detalleVenta.Desc2 = 0;
    }

    this.carritoService.calcularDetalleVenta();
  }

  borrarArticulo(index: number) {
    this.toolsService.confirmarAlerta('Eliminar ' + this.arrayCarrito[index].Nombre).then((resp) => {
      if (resp) {
        this.arrayCarrito.splice(index, 1)
        this.carritoService.calcularDetalleVenta()
      }

    })
  }

  async borrarTodos(preguntar: boolean = false) {

    if (preguntar) {
      await this.toolsService.confirmarAlerta('Se limpiara el carrito', 'info')
        .then((resp) => {
          if (resp) {
            this.isSelecArticulo = false;
            this.productoService.setListaPrecioCliente('');
            this.arrayCarrito.splice(0, this.arrayCarrito.length)
            this.carritoService.calcularDetalleVenta()
            this.carritoService.objCliente = {}
            this.objCliente = {}
            this.objCliente = this.carritoService.objCliente
            this.facturaForm.patchValue({
              formaPago: '',
              tipoDocumento: ''
            })
            this.productoService.refrescar()
            this.carritoService.documentoPendienteSeleccionado = ''
            localStorage.setItem('objCliente_' + this.loginService.getModulo(), JSON.stringify(this.objCliente));
            localStorage.setItem('arrCarrito_' + this.loginService.getModulo(), JSON.stringify(this.arrayCarrito));
          }
        })
    } else {
      this.arrayCarrito.splice(0, this.arrayCarrito.length)
      this.carritoService.calcularDetalleVenta()
      this.carritoService.objCliente = {}
      this.objCliente = {}
      this.objCliente = this.carritoService.objCliente
      this.productoService.refrescar();
      this.facturaForm.patchValue({
        formaPago: ''
      })
      this.carritoService.documentoPendienteSeleccionado = ''
      localStorage.setItem('objCliente_' + this.loginService.getModulo(), JSON.stringify(this.objCliente));
    }

  }

  async generarFactura() {
    console.log(this.facturaForm.getRawValue(), this.objFormaPago)
    if (this.arrayCarrito.length == 0) {
      this.toolsService.mostrarAlerta('Ingrese un Producto')
      return
    }

    if (this.isUbigeoLlegada == '') {
      this.toolsService.mostrarAlerta('Seleccione Ubigeo de Llegada')
      return
    }

    if (this.facturaForm.invalid) {
      this.facturaForm.markAllAsTouched()
      return
    }

    let estado = false
    await this.toolsService.confirmarAlerta('Finalizar Factura', 'warning').then((conf) => { estado = conf })
    if (!estado) return

    let idLoading: string = await this.toolsService.mostrarCargando('Creando Factura')

    this.carritoService.guardarFactura(this.datoFacturaCabecera()).then(async (resp) => {
      await this.toolsService.ocultarCargando(idLoading)
      if (resp.estado) {
        this.isSelecArticulo = false;
        this.productoService.setListaPrecioCliente('');
        this.toolsService.mostrarAlerta(`Factura ${resp.codigo} Creado`, 'success', 4000)
        this.facturaForm.reset({
          tipoDocumento: '',
          formaPago: '',
          fechaEntrega: this.toolsService.fechaYHoraIso(),
          glosa: ''
        }
        )
        this.borrarTodos()
        this.facturacionService.refresh()
        this.productoService.refrescar()
        this.promoS.refrescar()
      }
      else {
        this.toolsService.mostrarAlerta(resp.mensaje, 'error')
      }
    })

  }

  datoFacturaCabecera() {
    // console.log(this.facturaForm.getRawValue())
    let dataFormulario = this.facturaForm.getRawValue();

    let fechaDocumentoReferencia;
    if (this.docPendSeleccionado) {
      fechaDocumentoReferencia = this.toolsService.convertirFechaDate(this.docPendSeleccionado.Fecha, '/');

    }

    return {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta: this.loginService.punto_venta,
      anio: this.toolsService.year(),
      omitirVentaPrecioCosto: 'S',
      validar_precio_costo: 'N',
      consultar_stock: 'N',

      serie: dataFormulario.serie,
      numero_correlativo: '',
      tipo_documento: dataFormulario.tipoDocumento,
      tipo_movimiento: 'S',
      automatico: 'A',
      fecha_doc: this.toolsService.fechaYHora(),
      fecha_entr: this.toolsService.parsearIso(dataFormulario.fechaEntrega),
      fecha_validez: this.toolsService.addDays(this.toolsService.fechaYHora(), this.objFormaPago.nro_dias),
      moneda: 'S/',
      importe: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Importe, 2),
      forma_pago: dataFormulario.formaPago,
      codigo_cliente: this.objCliente.ccod_cliente,
      nombre_cliente: this.objCliente.cnom_cliente,
      ruc_cliente: this.objCliente.cnum_ruc.length == 0 ? this.objCliente.cnum_dni : this.objCliente.cnum_ruc,
      estado: 'Ingresado',
      observacion: '',
      mas_igv: this.carritoService.masIgv,
      tipo_cambio: 'VTA',
      tasa_cambio: this.carritoService.tipoCambioVenta,
      codigo_persona: '00',
      lista_precios: this.objCliente.lista_precios,
      telefono_cliente: this.objCliente.ctelefonos,
      fax: this.objCliente.cfax,
      email: this.objCliente.ce_mail,
      aprobado: 'Sin Aprobacion',
      fecha_aprobacion: '01/01/1900',
      codigo_empleado_aprobacion: '00',
      observacion_aprobacion: '',
      codigo_centro_costos: this.loginService.centro_costo,
      descuento: '0',
      orden_trabajo: '00',
      pto_partida: dataFormulario.puntoPartida, //this.loginService.datosUsu.cdireccion, //FALTA CONFIGURAR EL PUNTO DE PARTIDA
      pto_llegada: dataFormulario.direcciones,
      dias: this.objFormaPago.nro_dias,
      pais: this.objCliente.ccod_pais,
      atencion: 'Pendiente',
      porcentaje: '0',
      codigo_unidad_negocio: this.loginService.unidad_negocio,
      codigo_contacto: '00', // FALTA CONFIGURAR EL CONTACTO DEL CLIENTE
      nom_contacto: '', // FALTA CONFIGURAR EL CONTACTO DEL CLIENTE
      vendedor_1: this.loginService.objVendedor.ccod_vendedor,
      vendedor_2: '00',
      Glosa: dataFormulario.glosa,
      codigo_agencia: dataFormulario.agencias,
      usuario: this.loginService.codigo_usuario,
      codigo_usuario: this.loginService.codigo_usuario,
      Pc_User: 'App Movil',
      Pc_Fecha: this.toolsService.fechaYHora(),
      Pc_Ip: this.ip,
      comentario1: '',
      comentario8: '',
      erp_presupuesto: '00',
      subtotal_sin_descuentos: this.toolsService.redondear(this.carritoService.montoTotalesVenta.SubTotal_Sin_Descuentos, 2),
      erp_Ddescuento: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Descuentos, 2),
      erp_Dsubtotal: this.toolsService.redondear(this.carritoService.montoTotalesVenta.SubTotal_Con_Descuentos, 2),
      erp_Digv: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Igv, 2),
      erp_Dimporte: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Importe, 2),
      erp_Dpercepcion: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Total_Percepcion, 2),
      erp_Dtotal: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Total, 2),
      erp_ICBPER: 0,
      erp_gestor: '00',
      tipo: this.docPendSeleccionado ? this.docPendSeleccionado.Tipo_Documento == '09' ? 'FACTURAR GUIAS DE VENTA' : 'FACTURAR PEDIDO' : 'VENTA DIRECTA',
      tipo_documento_cliente: this.objCliente.tip_doc,
      codigo_transportista: '00',
      nombre_transportista: '',
      codigo_vehiculo: dataFormulario.vehiculo,
      motivo_traslado: '01',
      numero_orden: '',
      atencion_prod: 'Pendiente',
      porcentaje_prod: '0%',
      erp_tipdoc: '0',
      flag_ruta_contacto: 'N',
      ruta_contacto: '',
      erp_dscto_stock: 'S',
      erp_contacto_vendedor: '', //FALTA CONFIGURAR CONTACTO DE CLIENTE
      tipo_comprobante: '00',
      serie_comprobante: '',
      numero_comprobante: '',
      fecha_comprobante: '01/01/1900',
      tipo_documento_referencia: this.docPendSeleccionado ? this.docPendSeleccionado.Tipo_Documento : '00',
      serie_documento_referencia: this.docPendSeleccionado ? this.docPendSeleccionado.Codigo_Motivo_Serie : '',
      numero_documento_referencia: this.docPendSeleccionado ? this.docPendSeleccionado.Numero : '',
      fecha_referencia: this.docPendSeleccionado ? this.toolsService.parsearMysqlDate(fechaDocumentoReferencia) : '01/01/1900',
      anticipo: '0.00',
      impmn: '0.00',
      impme: '0.00',
      costo: '0.00',
      codigo_almacen_d: '',
      codigo_cliente_2: '',
      nombre_cliente_2: '',
      direccion_cliente_2: '',
      codigo_proveedor: '00',
      nombre_proveedor_c: '',
      modulo: 'Facturacion',
      ccod_almacen2: '',
      ccod_almacend2: '',
      codigo_transaccion: '00',
      codigo_detraccion: '00',
      contabilizada: 'N',
      serie_guia_prov: '',
      nro_guia_prov: '',
      serie_fac_prov: '',
      nro_fac_prov: '',
      fecha_emision: '01/01/1900',
      codigo_caja: '00',
      erp_vuelto: '0',
      erp_motivo: '00',
      erp_monto_recaudo: '0',
      erp_ck_recaudo_sn: 'N',
      erp_cuenta_recaudo: '00',
      erp_anexo_recaudo: '00',
      erp_tiporig_recaudo: 'N',
      estado_fe: 'Ingreso',
      detalleanulacion: '',
      fechagen: '01/01/1900',
      fechabaja: '01/01/1900',
      tribute_concept: 'OPERACION GRAVADA',
      motivo_nota: '',
      igv_icbper: '0.00',
      redondeo: '0.00',
      agencia_transporte: dataFormulario.agencias,
      codigo_chofer: dataFormulario.chofer,
      serie_destino: '',
      numero_destino: '',
      via_nom_partida: '',
      n_req: '',
      viatipo_partida: '',
      nro_partida: '',
      interior_partida: '',
      zona_partida: '',
      distrito_partida: '',
      prov_partida: '',
      dep_partida: '',
      tip_nro_doc_partida: '',
      viatipo_llegada: '',
      via_nom_llegada: '',
      nro_llegada: '',
      interior_llegada: '',
      zona_llegada: '',
      distrito_llegada: '',
      prov_llegada: '',
      dep_llegada: '',
      tipo_venta_ref: '',
      erp_ejecon: '',
      erp_percon: '',
      erp_codsub: '',
      erp_numcon: '',
      erp_costome: '0.00',
      erp_costomn: '0.00',
      erp_cosme: '0.00',
      erp_cosmn: '0.00',
      erp_iteref: '',
      ruta_cont_ped: '',
      erp_nro_exp: '',
      erp_ejercon_02: '',
      erp_percon_02: '',
      erp_cobsub_02: '',
      erp_numcon_02: '',
      erp_selecc: '',
      tipdoc_ref_2: '',
      ptovta_ref_2: '',
      motivo_ref_2: '',
      nro_ref_2: '',
      erp_cod_rubro: '00',
      cnum_lote: '',
      ubigeo_partida: dataFormulario.ubigeoPartida, //FALTA CONFIGURAR EL UBIGEO DE PARTIDA
      ubigeo_llegada: dataFormulario.ubigeoLlegada, //FALATA CONIGURAR EL UBIGFEO DE LLEGADA
      peso_total: '0', //FALTA CONFIGURAR EL PESO TOTAL
      num_bultos: '0', //FALTA CONFIGURAR EL NUMERO DE BULTOS
      ruta_pdf: '',
      placas_cliente: '',
      n_correlativo: '',
      numero_expediente1: '',
      numero_expediente2: '',
      tipo_operacion: 'OPERACION GRAVADA',

      datos_anticipos: JSON.stringify([]), 
      filas_detalle: this.datosFacturaDetalle()
    }
  }

  datosFacturaDetalle() {
    let filas_detalle = []
    this.carritoService.arrayCarrito.forEach((element) => {
      filas_detalle.push({
        Codigo: element.Codigo,
        Nombre: element.Nombre,
        Codigo_Unidad: element.Codigo_Unidad,
        Factor: element.Factor,
        Cantidad_Kardex: element.Cantidad_Kardex,
        Cantidad: element.Cantidad,
        Igv: element.Igv,
        Unit: this.toolsService.redondear(element.Unit, 2),
        Base_Imponible: this.toolsService.redondear(element.Base_Imponible, 2),
        Base_Calculada: this.toolsService.redondear(element.Base_Calculada, 2),
        Importe: this.toolsService.redondear(element.Importe, 2),
        Igv_Art: element.Igv_Art,
        Precio_original: element.Precio_original,
        Desc1: element.Desc1,
        Desc2: element.Desc2,
        Monto_Descuento: this.toolsService.redondear(element.Monto_Descuento, 2),
        Stock_SN: 'S',
        Lote_SN: 'N',
        Lote_Numero: '',
        Lote_Vencimiento: '1900-01-01',
        Serie_SN: 'N',
        Serie_Numero: '',
        Barticulo: 'S',
        Origen_Punto_Venta: element.Origen_Punto_Venta,
        Origen_Serie: element.Origen_Serie,
        Origen_Numero: element.Origen_Numero,
        Origen_NItem: element.Origen_NItem,
        Cantidad_presentacion: element.Cantidad,
        Unidad_presentacion: element.Codigo_Unidad,
        Nombre_presentacion: element.Nombre,
        Precio_presentacion: this.toolsService.redondear(element.Unit, 2),
        Codigo_Almacen: this.loginService.ccod_almacen,
        Desc3: 0,
        Percepcion_sn: '',
        Percepcion_uni: 0,
        Perpecion_porc: 0,
        Boni_sn: '',
        BonItem_bonii_sn: '0',
        Desc4: 0,
        Peso: element.Peso,
        Base_calculada_dec: this.toolsService.redondear(element.Base_calculada_dec, 2),
        Base_imp_dec: this.toolsService.redondear(element.Base_imp_dec, 2),
        Igv_dec: this.toolsService.redondear(element.Igv_dec, 2),
        Importe_dec: this.toolsService.redondear(element.Importe_dec, 2),
        Comision_porcentaje: 0,
        Comision_monto: 0,
        Codigo_presentacion: element.Codigo,
        Codigo_Cencos: '00',
        Codigo_OT: '00',
        Codigo_Unidad_negocio: '00',
        pedido_numero: element.pedido_numero,
        pedido_motivo: element.pedido_motivo,
        pedido_punto_venta: element.pedido_punto_venta,
        pedido_nitem: element.pedido_nitem,
        guia_punto_venta: element.guia_punto_venta,
        guia_serie: element.guia_serie,
        guia_numero: element.guia_numero,
        guia_nitem: element.guia_nitem
      })
    });
    console.log(filas_detalle);
    return JSON.stringify(filas_detalle);
  }

  async eventoAbrirModal(event) {
    this.edicionCampo = true;

    const modal = await this.modalCtrl.create({
      component: ModalDireccionComponent,
      componentProps: {
        direcciones: this.carritoService.arrDirecciones
      },
      animated: true,
      id: 'modal-direccion',
    });

    modal.onDidDismiss().then((direccion) => {
      if (direccion !== null && direccion.role != "backdrop") {
        var direc = direccion.data
        this.facturaForm.patchValue({
          direcciones: direc.direccion
        })
      }
    });

    await modal.present();
  }

  async mostrarModalPromociones(documento: any) {
    const modal = await this.modalCtrl.create({
      component: ModalPromocionesComponent,
      componentProps: {
        documento: documento
      }
    });

    await modal.present();
  }

  modificarDireccion() {
    this.edicionCampo = true;
  }

  async cargarDocumentoPendiente(data: any) {
    let idLoading: string = await this.toolsService.mostrarCargando('Consultando Documento')
    console.log(data);

    if (data.Tipo_Documento == '09') {
      await this.guiasRemisionService.consultarDetalleGuiaPendiente(data.Punto_Venta, data.Codigo_Motivo_Serie, data.Numero,).then(async (resp) => {

        this.arrayCarrito = resp;
        this.carritoService.arrayCarrito = this.arrayCarrito;

      });
    } else {
      await this.pedidosService.consultarDetallePedidioPendiente(data.Punto_Venta, data.Codigo_Motivo_Serie, data.Numero,).then(async (resp) => {

        this.arrayCarrito = resp;
        this.carritoService.arrayCarrito = this.arrayCarrito;

      });
    }

    await this.clienteService.consultarCliente(data.Codigo_Cliente).then(async (resp) => {
      console.log(resp);
      let dataCliente = resp[0];

      await this.clienteService.clienteFormasPago(data.Codigo_Cliente).then((resp) => {
        dataCliente.forma_pagos = resp
      })

      await this.clienteService.clienteDirecciones(data.Codigo_Cliente).then((resp) => {
        dataCliente.direcciones = resp
      })
      await this.clienteService.clienteAgencias(data.Codigo_Cliente).then((resp) => {
        dataCliente.agencias = resp
      })

      await this.carritoService.agregarCliente(dataCliente)

    });

    this.edicionCampo = true;

    if (data.Tipo_Documento == '09') {
      this.facturaForm.patchValue({
        tipoDocumento: '03',
        'direcciones': data.Punto_Llegada,
        'agencias': data.Agencia_Transporte,
        'formaPago': data.Forma_Pago,
        'fechaEntrega': data.Fecha_Entrega_Iso,
        'ubigeoLlegada': this.objCliente.codigoUbigeo,
        'vehiculo': data.Codigo_Vehiculo,
        'chofer': data.Codigo_Chofer
      })

      this.changeTipoDocumento();
    } else {
      let tipoDocumento = data.Tipo_Documento_Pago == ''? '03' : data.Tipo_Documento_Pago
      this.facturaForm.patchValue({
        tipoDocumento: tipoDocumento,
        'direcciones': data.Punto_Llegada,
        'agencias': data.codigo_agencia_transporte,
        'formaPago': data.Codigo_Forma_Pago,
        'fechaEntrega': data.Fecha_Entrega_Iso,
        'ubigeoLlegada': this.objCliente.codigoUbigeo
      })

      this.changeTipoDocumento();
    }

    this.formaPagoChange();
    this.datosPuntoVenta();
    await this.toolsService.ocultarCargando(idLoading)
  }

  async datosPuntoVenta() {
    return new Promise((resolve) => {
      this.puntoVentaService.datosPuntoVenta(this.loginService.punto_venta).subscribe((resp) => {
        this.facturaForm.patchValue({ puntoPartida: resp[0].Direccion });
        this.facturaForm.patchValue({ ubigeoPartida: resp[0].Ubigeo });
        resolve('acabo')
      }, (err) => {
        this.toolsService.mostrarAlerta(err, 'error')
        console.log(err);
      })
    })
  }

  async listaUbigeos() {
    return new Promise((resolve) => {
      this.ubigeoService.listaUbigeos().subscribe((resp) => {
        this.arrUbigeos = resp;
        resolve('acabo')
      }, (err) => {
        this.toolsService.mostrarAlerta(err, 'error')
        console.log(err);
      })
    })
  }

  async listaVehiculos() {
    return new Promise((resolve) => {
      this.vehiculoSevice.listaVehiculos().subscribe((resp) => {
        this.arrVehiculos = resp;
        resolve('acabo')
      }, (err) => {
        this.toolsService.mostrarAlerta(err, 'error')
        console.log(err);
      })
    })
  }

  async listaChoferes() {
    return new Promise((resolve) => {
      this.choferService.listaChoferes().subscribe((resp) => {
        this.arrChoferes = resp;
        resolve('acabo')
      }, (err) => {
        this.toolsService.mostrarAlerta(err, 'error')
        console.log(err);
      })
    })
  }

  abrirModalUbigeos() {
    this.ubigeoOpen = true;
  }

  ubigeoSelectionChanged(ubigeos: any) {
    this.facturaForm.patchValue({
      ubigeoLlegada: ubigeos.Codigo,
    })
    this.ubigeoOpen = false
  }

  cerrarModalUbigeos() {
    this.ubigeoOpen = false;
  }

  get isUbigeoLlegada() {
    return this.facturaForm.get('ubigeoLlegada').value;
  }
}
