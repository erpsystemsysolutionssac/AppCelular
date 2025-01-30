import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { element } from 'protractor';
import { DetalleVenta } from 'src/app/interfaces/detalle-venta';
import { Cliente, FormaPago, Vendedor, filtroListaPrecio } from 'src/app/interfaces/interfases';
import { LoginService } from 'src/app/service/login.service';
import { clienteService } from 'src/app/service/mantenimiento/cliente.service';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { PromocionesService } from 'src/app/service/tomadorPedidos/promociones.service';
import { ToolsService } from 'src/app/service/tools.service';
import { ModalDireccionComponent } from '../../components/modal-direccion/modal-direccion.component';
import { ModalPromocionesComponent } from '../../components/modal-promociones/modal-promociones.component';

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

  public arrTipoDocu: any[] = []
  public listaTalonar: any[] = []
  public arrTalonar: any[] = []
  public objVendedor: Vendedor = {}

  public pedidoForm: FormGroup
  public tipoCambio: number

  private ip: string
  private objFormaPago: FormaPago = {}
  public isSelecArticulo: boolean = false;

  private edicionCampo: boolean = false;

  public websocket;

  constructor(
    private clienteService: clienteService,
    private router: Router,
    private route: ActivatedRoute,
    public carritoService: CarritoService,
    private toolsService: ToolsService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private pedidoS: PedidosService,
    private productoService: ProductoService,
    private promoS: PromocionesService,
    private modalCtrl: ModalController,
  ) {

   }

  ngOnInit() {

    this.pedidoForm = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      // serie:['',[Validators.required]],
      direcciones: [''],
      agencias: ['00'],
      formaPago: ['', [Validators.required]],
      fechaEntrega: [this.toolsService.fechaYHoraIso(), [Validators.required]],
      glosa: ['']
    })
    this.arrayCarrito = this.carritoService.arrayCarrito;
    this.arrfiltroListaPrecio = this.carritoService.arrfiltroListaPrecio
    this.objCliente = this.carritoService.objCliente
    
    this.objVendedor = this.loginService.objVendedor
    this.listarTipoDocuYTalo();
  }

  get clienteExiste() {
    
    if (Object.keys(this.objCliente).length == 0) {
      return false
    } else {
      if (!this.edicionCampo) {
        this.pedidoForm.patchValue({
          direcciones: this.objCliente.cdireccion,
        })
      }
      return true
    }
  }

  async listarTipoDocuYTalo() {
    let idLoaing = await this.toolsService.mostrarCargando()

    await Promise.all([
      this.carritoService.listaTipoDocumento(),
      this.carritoService.listaTalonar(),
      this.carritoService.getPublicIP(),
    ]).then((resp: any) => {
      if (resp.estado) console.log(resp.msg);
      this.arrTipoDocu.push(...resp[0])
      this.listaTalonar.push(...resp[1])
      this.ip = resp[2]
    }).catch((err) => { console.log(err); })

    await this.toolsService.ocultarCargando(idLoaing)
  }

  cambiarTalonar(e: any) {
    let value = e.detail.value
    this.arrTalonar = this.listaTalonar.filter((tipo) => {
      return tipo.tip_doc == value
    })
  }

  formaPagoChange(e: any) {
    let fopa = this.carritoService.arrFormasPago
      .find((forma) => {
        return forma.ccod_forpago == e.detail.value
      })
    this.objFormaPago = fopa

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
    if(detalleVenta.Cantidad > 0){
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
            this.pedidoForm.patchValue({
              formaPago: '',
              tipoDocumento: ''
            })
            this.productoService.refrescar()
            localStorage.setItem('objCliente_'+this.loginService.getModulo(), JSON.stringify(this.objCliente));
            localStorage.setItem('arrCarrito_'+this.loginService.getModulo(), JSON.stringify(this.arrayCarrito));
          }
        })
    } else {
      this.arrayCarrito.splice(0, this.arrayCarrito.length)
      this.carritoService.calcularDetalleVenta()
      this.carritoService.objCliente = {}
      this.objCliente = {}
      this.objCliente = this.carritoService.objCliente
      this.productoService.refrescar();
      this.pedidoForm.patchValue({
        formaPago: ''
      })
      localStorage.setItem('objCliente_'+this.loginService.getModulo(), JSON.stringify(this.objCliente));
    }

  }

  async generarPedido() {

    if (this.arrayCarrito.length == 0) {
      this.toolsService.mostrarAlerta('Ingrese un Producto')
      return
    }

    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched()
      return
    }

    let estado = false
    await this.toolsService.confirmarAlerta('Finalizar Pedido', 'warning').then((conf) => { estado = conf })
    if (!estado) return

    let idLoading: string = await this.toolsService.mostrarCargando('Creando Pedido')

    this.carritoService.guardarPedido(this.datosPedidoCabecera()).then(async (resp) => {
      await this.toolsService.ocultarCargando(idLoading)
      if (resp.estado) {
        this.isSelecArticulo = false;
        this.productoService.setListaPrecioCliente('');
        this.toolsService.mostrarAlerta(`Pedido ${resp.codigo} Creado`, 'success', 4000)
        this.pedidoForm.reset({
          tipoDocumento: '',
          formaPago: '',
          fechaEntrega: this.toolsService.fechaYHoraIso(),
          glosa: ''
        }
        )
        this.borrarTodos()
        this.pedidoS.refresh()
        this.productoService.refrescar()
        this.promoS.refrescar()

      }
      else {
        this.toolsService.mostrarAlerta(resp.mensaje, 'error')
      }
    })

  }

  datosPedidoCabecera(){
    // console.log(this.pedidoForm.getRawValue())
    let dataFormulario = this.pedidoForm.getRawValue();
    return {
      codigo_empresa: this.loginService.codigo_empresa,
      codigo_punto_venta: this.loginService.punto_venta,
      anio: this.toolsService.year(),
      omitirVentaPrecioCosto: 'S',
      validar_precio_costo: 'N',
      consultar_stock: 'N',

      motivo: '07',
      // numero_correlativo: '',
      automatico: 'A',
      fecha_doc: this.toolsService.fechaYHora(),
      fecha_entr: this.toolsService.parsearIso(dataFormulario.fechaEntrega),
      codigo_cliente: this.objCliente.ccod_cliente,
      nombre_cliente: this.objCliente.cnom_cliente,
      ruc_cliente: this.objCliente.cnum_ruc.length == 0 ? this.objCliente.cnum_dni : this.objCliente.cnum_ruc,
      forma_pago: dataFormulario.formaPago,
      vendedor_1: this.loginService.objVendedor.ccod_vendedor,
      vendedor_2: '00',
      moneda: 'S/',
      mas_igv: this.carritoService.masIgv,
      tipo_cambio: 'VTA',
      tasa_cambio: this.carritoService.tipoCambioVenta,
      importe: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Importe, 2),
      tipo: 'PEDIDO DE PTOVTA',
      descuento: '0',
      numero_orden: '',
      lista_precios: this.objCliente.lista_precios,
      pais: this.objCliente.ccod_pais,
      codigo_centro_costos: this.loginService.centro_costo,
      codigo_unidad_negocio: '00',
      codigo_agencia: dataFormulario.agencias,
      orden_trabajo: '00',
      numero_referencia: '',
      estado: 'Ingresado',
      atencion: 'Pendiente',
      porcentaje: '0 %',
      atencion_prod: '',
      porcentaje_prod: '',
      aprobado: 'Sin Aprobacion',
      fecha_aprobacion: '0000-00-00 00:00:00',
      observacion_aprobacion: '',
      codigo_empleado_aprobacion: '',
      codigo_transportista: '00',
      nombre_transportista: '',
      codigo_vehiculo: '00',
      pto_partida: this.loginService.datosUsu.cdireccion,
      pto_llegada: dataFormulario.direcciones,
      codigo_contacto: '',
      nom_contacto: '',
      motivo_traslado: '01',
      observacion: '',
      comentario2: '',
      comentario3: '',
      comentario4: '',
      comentario5: '',
      comentario6: '',
      comentario7: '',
      codigo_usuario: this.loginService.codigo_usuario,
      Pc_User: 'App Movil',
      Pc_Fecha: this.toolsService.fechaYHora(),
      Pc_Ip: this.ip,
      erp_tipdoc: '00',
      comentario8: '',
      comentario1: '',
      observacion2: '',
      observacion3: '',
      observacion4: '',
      observacion5: '',
      observacion6: '',
      observacion7: '',
      observacion8: '',

      flag_ruta_contacto: '',
      ruta_contacto: '',
      erp_presupuesto: '',
      erp_dscto_stock: 'S',
      erp_Dsubtotal: this.toolsService.redondear(this.carritoService.montoTotalesVenta.SubTotal_Con_Descuentos, 2),
      erp_Ddescuento: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Descuentos, 2),
      erp_Digv: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Igv, 2),
      erp_Dimporte: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Importe, 2),
      erp_Dpercepcion: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Total_Percepcion, 2),
      erp_Dtotal: this.toolsService.redondear(this.carritoService.montoTotalesVenta.Total, 2),
      Glosa: dataFormulario.glosa,
      dias: this.objFormaPago.nro_dias,
      erp_gestor: '00',
      fecha_validez: this.toolsService.fechaYHora(),
      erp_contacto_vendedor: '',
      subtotal_sin_descuentos: this.toolsService.redondear(this.carritoService.montoTotalesVenta.SubTotal_Sin_Descuentos, 2),
      numero_expediente1: '',
      numero_expediente2: '',
      ruta_pdf: '',
      codigo_cliente_2: this.objCliente.ccod_cliente,
      nombre_cliente_2: this.objCliente.cnom_cliente,
      direccion_cliente_2: this.objCliente.cdireccion,
      agencia_transporte: dataFormulario.agencias,
      placas_cliente: '',

      filas_detalle: this.datosPedidoDetalle()
    }
  }

  datosPedidoDetalle(){
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
        Lote_SN: 'N',
        Lote_Numero: '',
        Lote_Vencimiento: '0000-00-00 00:00:00',
        Serie_SN: 'N',
        Serie_Numero: '',
        Barticulo: 'S',
        Origen_Punto_Venta: '',
        Origen_Serie: '',
        Origen_Numero: '',
        Origen_NItem: '',
        Cantidad_presentacion: element.Cantidad,
        Unidad_presentacion: element.Codigo_Unidad,
        Nombre_presentacion: element.Nombre,
        Precio_presentacion: this.toolsService.redondear(element.Unit, 2),
        Codigo_Almacen: this.loginService.ccod_almacen,
        Desc3: element.Desc3,
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
        Codigo_Unidad_negocio: '00'
      })
    });

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
        this.pedidoForm.patchValue({
          direcciones: direc.direccion
        })
      }
    });

    await modal.present();
  }

  async mostrarModalPromociones(documento: any){
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

}
