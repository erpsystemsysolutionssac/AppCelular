import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Articulo, Cliente, FormaPago, Vendedor, filtroListaPrecio } from 'src/app/interfaces/interfases';
import { LoginService } from 'src/app/service/login.service';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';
import { ClienteService } from 'src/app/service/tomadorPedidos/cliente.service';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';
import { PromocionesService } from 'src/app/service/tomadorPedidos/promociones.service';
import { ToolsService } from 'src/app/service/tools.service';
import { ModalDireccionComponent } from '../modal-direccion/modal-direccion.component';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit {

  @ViewChildren("listaCantidadCarrito", { read: ElementRef }) private listaCantidadCarrito: QueryList<ElementRef>;
  @ViewChild('fecha', { read: ElementRef }) fecha: ElementRef<HTMLElement>;

  public arrCarrito: Articulo[] = []
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

  private subscricion: Subscription = null

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute,
    public carritoService: CarritoService,
    private tools: ToolsService,
    private fb: FormBuilder,
    private logins: LoginService,
    private pedidosService: PedidosService,
    private artituloS: ArticuloService,
    private promoS: PromocionesService,
    private modalCtrl: ModalController,
  ) {

   }

  ngOnInit() {

    this.pedidoForm = this.fb.group({
      // tipoDocumento: ['', [Validators.required]],
      // serie:['',[Validators.required]],
      direcciones: [''],
      agencias: ['00'],
      formaPago: ['', [Validators.required]],
      fechaEntrega: [this.tools.fechaYHoraIso(), [Validators.required]],
      glosa: ['']
    })
    this.arrCarrito = this.carritoService.arrCarrito
    this.arrfiltroListaPrecio = this.carritoService.arrfiltroListaPrecio
    this.objCliente = this.carritoService.objCliente
    
    this.objVendedor = this.logins.objVendedor
    this.listarTipoDocuYTalo();

    this.route.params.subscribe(async (param)=>{
      if(this.carritoService.documentoPendienteSeleccionado)
      this.cargarDocumentoPendiente(this.carritoService.documentoPendienteSeleccionado);
    });
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
    let idLoaing = await this.tools.mostrarCargando()

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

    await this.tools.ocultarCargando(idLoaing)
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
    this.isSelecArticulo = this.arrCarrito.length == 0 ? false : true;

    this.clienteService.clientesOn = true
    this.clienteService.refresh()
    this.router.navigate(['../clientes'], { relativeTo: this.route })
  }

  seleccionarArticulo() {
    this.isSelecArticulo = true;
    this.artituloS.refrescar();
    this.artituloS.setListaPrecioCliente(this.objCliente.lista_precios);

    this.artituloS.eventSeleccionArticulo.next(true);
    this.router.navigate(['../articulos'], { relativeTo: this.route })

  }

  sumarCantidad(cod: any) {
    let value: number
    let articulo = this.listaCantidadCarrito.find((item) => {
      return item.nativeElement.id == cod
    })
    let articu = this.arrCarrito.find((articulo, i) => {
      return i == cod
    })
    value = articulo.nativeElement.value
    value++
    articu.cantidad = value

    articulo.nativeElement.value = value

  }

  restarCantidad(cod: any) {
    let value: number
    let articulo = this.listaCantidadCarrito.find((item) => {
      return item.nativeElement.id == cod
    })
    let articu = this.arrCarrito.find((articulo, i) => {
      return i == cod
    })
    value = articulo.nativeElement.value
    if (value == 1) return
    value--
    articu.cantidad = value

    articulo.nativeElement.value = value
  }

  valorInput(event: any, cod: number) {
    let inputValor = parseInt(event.detail.value)
    if (isNaN(inputValor) || inputValor <= 0) {
      inputValor = 1
    }
    let articu = this.arrCarrito.find((articulo, i) => {
      return i == cod
    })

    articu.cantidad = inputValor

    var lstaprecios_calcular = this.arrfiltroListaPrecio[0]
    articu.listaPrecios.forEach((precio) => {
      if (String(lstaprecios_calcular) == "lista_precios_provincia") {
        precio.monto = 0;
        articu.listaPrecios[0].precioOriginal = 0;
        articu.listaPreciosRango.forEach(element => {
          if (element.codigo == precio.codigo && element.unidad == precio.unidad) {
            if (articu.cantidad >= element.minimo && articu.cantidad <= element.maximo) {


              articu.listaPrecios[0].precioOriginal = element.precioOriginal
              let total = this.tools.redondear(element.precioOriginal) * articu.cantidad
              if (articu.descuentoPromo != undefined && articu.descuentoPromo > 0) {

                var porc_descuento = 0;
                var monto_descuento = 0;
                if (articu.descuento_monto_porcentaje == "P") {
                  porc_descuento = articu.descuentoPromo / 100
                  monto_descuento = total * porc_descuento
                } else {
                  porc_descuento = articu.descuentoPromo
                  monto_descuento = articu.descuentoPromo
                }

                // total = total - this.tools.redondear(total  * (articu.descuentoPromo/100)) 
                total = total - monto_descuento
              }

              precio.monto = total
              
              if (this.carritoService.masIgv == 'S') {
                console.log('masIgv: SI');
                precio.montoMasIgv = this.tools.redondear(total * (1 + (articu.nigv / 100)),2);
              } else {
                console.log('masIgv: NO');
                precio.montoMasIgv = total;
              }
            }
          }
        });
      } else {

        precio.precioOriginal = precio.precioLista;
        articu.listaDescuentos.forEach(element => {
          if (element.codigo == precio.codigo && element.unidad == precio.unidad) {
            if (articu.cantidad >= element.minimo && articu.cantidad <= element.maximo) {

              var porc_descuento = 0;
              var monto_descuento = 0;
              if (articu.descuento_monto_porcentaje == "P") {
                var porc_descuento = element.descuento / 100
                var monto_descuento = precio.precioLista * porc_descuento
              } else {
                porc_descuento = element.descuento
                monto_descuento = element.descuento
              }
              precio.precioOriginal = precio.precioLista - monto_descuento * 1;
            }
          }
        })


        let total = this.tools.redondear(precio.precioOriginal) * articu.cantidad

        if (articu.descuentoPromo != undefined && articu.descuentoPromo > 0) {

          var porc_descuento = 0;
          var monto_descuento = 0;
          if (articu.descuento_monto_porcentaje == "P") {
            porc_descuento = articu.descuentoPromo / 100
            monto_descuento = total * porc_descuento
          } else {
            porc_descuento = articu.descuentoPromo
            monto_descuento = articu.descuentoPromo
          }

          // total = total - this.tools.redondear(total  * (articu.descuentoPromo/100)) 
          total = total - monto_descuento
        }
        
        precio.monto = total;

        if (this.carritoService.masIgv == 'S') {
          console.log('masIgv: SI');
          precio.montoMasIgv = this.tools.redondear(total * (1 + (articu.nigv / 100)),2);
        } else {
          console.log('masIgv: NO');
          precio.montoMasIgv = total;
        }
        
      }
    })

    this.carritoService.calcularMontoTotal()
  }

  valorPromocion(event: any, cod: number) {

    let articulo = this.listaCantidadCarrito.find((item) => {
      return item.nativeElement.id == cod
    })

    let articu = this.arrCarrito.find((articulo, i) => {
      return i == cod
    })

    if ((event.detail).checked) {
      if (articu.descuento_monto_porcentaje == "P") {
        articu.descuentoPromo = 100
      } else {
        articu.descuentoPromo = articu.listaPrecios[0].precioOriginal * articu.cantidad;
      }
    } else {
      articu.descuentoPromo = articu.descuento;
    }

    this.datosDetallePedido()
    this.carritoService.calcularMontoTotal()

  }


  borrarArticulo(index: number) {
    this.tools.confirmarAlerta('Eliminar ' + this.arrCarrito[index].nombre).then((resp) => {
      if (resp) {
        this.arrCarrito.splice(index, 1)
        this.carritoService.calcularMontoTotal()
      }

    })
  }

  async borrarTodos(preguntar: boolean = false) {

    if (preguntar) {
      await this.tools.confirmarAlerta('Se limpiara el carrito', 'info')
        .then((resp) => {
          if (resp) {
            this.isSelecArticulo = false;
            this.artituloS.setListaPrecioCliente('');
            this.arrCarrito.splice(0, this.arrCarrito.length)
            this.carritoService.calcularMontoTotal()
            this.carritoService.objCliente = {}
            this.objCliente = {}
            this.objCliente = this.carritoService.objCliente
            this.pedidoForm.patchValue({
              formaPago: '',
              tipoDocumento: ''
            })
            this.artituloS.refrescar()
            localStorage.setItem('objCliente_'+this.carritoService.modulo, JSON.stringify(this.objCliente));
            localStorage.setItem('arrCarrito_'+this.carritoService.modulo, JSON.stringify(this.arrCarrito));
          }
        })
    } else {
      this.arrCarrito.splice(0, this.arrCarrito.length)
      this.carritoService.calcularMontoTotal()
      this.carritoService.objCliente = {}
      this.objCliente = {}
      this.objCliente = this.carritoService.objCliente
      this.pedidoForm.patchValue({
        formaPago: ''
      })
    }

  }

  async hacerPedido(form: FormGroup) {

    if (this.arrCarrito.length == 0) {
      this.tools.mostrarAlerta('Ingrese un Producto')
      return
    }

    if (form.invalid) {
      form.markAllAsTouched()
      return
    }

    form.value.fecha = this.tools.parsearIso(form.value.fechaEntrega)

    let estado = false
    await this.tools.confirmarAlerta('Finalizar Guia', 'warning').then((conf) => { estado = conf })
    if (!estado) return

    let idLoading: string = await this.tools.mostrarCargando('Creando Pedido')
    
    await this.carritoService.crearGuiaRemision(
      this.datosDetallePedido(),
      this.datosCabeceraPedido(form.value))
      .then(async (resp) => {
        await this.tools.ocultarCargando(idLoading)
        if (resp.estado) {
          this.isSelecArticulo = false;
          this.artituloS.setListaPrecioCliente('');
          this.tools.mostrarAlerta(`Guia ${resp.codigo} Creado`, 'success', 4000)
          this.pedidoForm.reset({
            tipoDocumento: '',
            formaPago: '',
            fechaEntrega: this.tools.fechaYHoraIso(),
            glosa: ''
          }
          )
          this.borrarTodos()
          this.pedidosService.refresh()
          this.artituloS.refrescar()
          this.promoS.refrescar()

        }
        else {
          this.tools.mostrarAlerta(resp.mensaje, 'error')
        }
      })

  }


  datosCabeceraPedido(datos: any) {
    let subtotal_sin_descuentos = this.carritoService.carritoMontoTotal
    let descuento = this.carritoService.carritoDescuento
    let subTotal = subtotal_sin_descuentos - descuento

    let subtotal_sin_igv: number = this.tools.redondear(subTotal / 1.18, 2)
    let igv: number = this.tools.redondear(subTotal - subtotal_sin_igv, 2)
    let total: number = subTotal
    console.log(this.carritoService.documentoPendienteSeleccionado);
    return {
      // motivo:datos.tipoDocumento,
      codigo_empresa: '0000000001',
      codigo_punto_venta: '001',
      codigo_movimiento: '09',
      tipo_movimiento: 'S',
      motivo: 'T001',
      // numero_correlativo: 0,
      fecha_doc: this.tools.fechaYHora(),
      dias: this.objFormaPago.nro_dias || 0,
      fecha_entr: this.tools.fechaYHora(),
      moneda: 'S/',
      forma_pago: datos.formaPago,
      erp_Dsubtotal: this.carritoService.carritoSubTotal_ConDescuento,
      erp_Digv: this.carritoService.carritoIGV,
      erp_Dimporte: this.carritoService.carritoMontoTotal,
      anticipo: 0,
      impmn: 0,
      impme: 0,
      costo: 0,
      tipo_documento_referencia: 'PED',
      serie_documento_referencia: this.carritoService.documentoPendienteSeleccionado.Codigo_Motivo_Serie,
      numero_documento_referencia: this.carritoService.documentoPendienteSeleccionado.Numero,
      fecha_referencia: this.tools.fechaYHora(),
      codigo_almacen_d: '001',
      codigo_cliente: this.objCliente.ccod_cliente,
      nombre_cliente: this.objCliente.cnom_cliente,
      ruc_cliente: this.objCliente.cnum_ruc.length == 0 ? this.objCliente.cnum_dni : this.objCliente.cnum_ruc,
      codigo_cliente_2: this.objCliente.ccod_cliente,
      nombre_cliente_2: this.objCliente.cnom_cliente,
      codigo_proveedor: '00',
      nombre_proveedor_c: '',
      estado: 'Ingresado',
      porcentaje: '',
      atencion: 'Pendiente',
      modulo: 'Guia_Venta',
      tipo_cambio: 'VTA',
      tasa_cambio: this.carritoService.tipoCambioVenta,
      erp_dscto_stock: 0,
      ccod_almacen2: '00',
      ccod_almacend2: '00',
      automatico: 'A',
      serie_destino: '',
      numero_destino: '',
      vendedor_1: '00',
      vendedor_2: '00',
      codigo_transaccion: '00',
      codigo_unidad_negocio: '00',
      codigo_centro_costos: '00',
      orden_trabajo: '00',
      codigo_vehiculo: '00',
      codigo_transportista: '00',
      codigo_chofer: '00',
      pais: '001',
      tipo: 'GUIA DE PEDIDO',
      numero_orden: '',
      mas_igv: this.carritoService.masIgv,
      descuento: 0,
      motivo_traslado: '00',
      lista_precios: this.objCliente.lista_precios,
      observacion: '',
      Glosa: datos.glosa,
      tipo_comprobante: '',
      serie_comprobante: '',
      numero_comprobante: '',
      fecha_comprobante: this.tools.fechaYHora(),
      pto_partida: '',
      pto_llegada: datos.direcciones,
      codigo_detraccion: '',
      codigo_agencia: '',
      contabilizada: 'S',
      serie_guia_prov: '',
      nro_guia_prov: '',
      serie_fac_prov: '',
      nro_fac_prov: '',
      fecha_emision: this.tools.fechaYHora(),
      n_req: '',
      viatipo_partida: '',
      via_nom_partida: '',
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
      direccion_cliente_2: '',
      zona_llegada: '',
      distrito_llegada: '',
      prov_llegada: '',
      dep_llegada: '',
      tipo_venta_ref: '',
      erp_ejecon: '',
      erp_percon: '',
      erp_codsub: '',
      erp_numcon: '',
      erp_costome: '',
      erp_costomn: '',
      Pc_User: 'App movil',
      Pc_Fecha: this.tools.fechaYHora(),
      Pc_Ip: this.ip,
      erp_cosme: 0,
      erp_cosmn: 0,
      erp_iteref: '',
      codigo_caja: '',
      erp_vuelto: '',
      ruta_cont_ped: '',
      erp_presupuesto: '00',
      erp_motivo: '00',
      erp_Ddescuento: this.carritoService.carritoMontoTotal_Descontado,
      erp_Dpercepcion: 0,
      erp_Dtotal: this.carritoService.carritoMontoTotal,
      erp_gestor: '00',
      numero_expediente1: '',
      agencia_transporte: '',
      erp_ejercon_02: '',
      erp_percon_02: '',
      erp_cobsub_02: '',
      erp_numcon_02: '',
      erp_selecc: '',
      tipdoc_ref_2: '',
      ptovta_ref_2: '',
      motivo_ref_2: '',
      nro_ref_2: '',
      fecha_validez: this.tools.fechaYHora(),
      erp_contacto_vendedor: '00',
      erp_monto_recaudo: '',
      erp_ck_recaudo_sn: '',
      erp_cuenta_recaudo: '',
      erp_anexo_recaudo: '',
      erp_tiporig_recaudo: '',
      erp_cod_rubro: '',
      detalleanulacion: '',
      fechagen: this.tools.fechaYHora(),
      fechabaja: this.tools.fechaYHora(),
      cnum_lote: '',
      tribute_concept: '',
      subtotal_sin_descuentos: '',
      numero_expediente2: '',
      ruta_pdf: '',
      ubigeo_partida: '',
      ubigeo_llegada: '',
      usuario_areas: '',
      peso_total: '',
      codigo_contacto: '',
      nom_contacto: '',
      placas_cliente: '',
      num_bultos: ''
    }

  }

  datosDetallePedido() {

    let arrDatos: any[] = []
    let carritoSubTotal_SinDescuento: number = 0
    let carritoSubTotal_ConDescuento: number = 0
    let carritoIGV: number = 0
    let carritoMontoTotal: number = 0
    let carritoMontoTotal_Descontado: number = 0

    this.arrCarrito.forEach((articulo) => {
      let subtotal: number
      let subtotal_descontado: number
      let igv_line: number
      let montoDolar = 0
      let precioBase = 0
      let montoDesc_original = 0
      let montoDesc = 0
      let total_importe = 0;
      let total_importe_con_descuentos = 0;
      let montoTotal = 0;
      let nigv = this.tools.redondear(articulo.nigv / 100, 2)
      if (articulo.moneda == '$') {
        montoDolar = this.tools.redondear(articulo.listaPrecios[0].monto * this.carritoService.tipoCambioVenta)
        precioBase = this.tools.redondear(articulo.listaPrecios[0].precioOriginal * this.carritoService.tipoCambioVenta)
        total_importe = this.tools.redondear(precioBase * articulo.cantidad)
      }
      else {
        precioBase = this.tools.redondear(articulo.listaPrecios[0].precioOriginal,2)
        total_importe = this.tools.redondear(precioBase * articulo.cantidad)
      }

      if (articulo.descuentoPromo != undefined && articulo.descuentoPromo > 0) {

        if (articulo.descuento_monto_porcentaje == "P") {
          montoDesc_original = this.tools.redondear(total_importe * (articulo.descuentoPromo / 100))
        } else {
          montoDesc_original = articulo.descuentoPromo
        }

      }

      if (this.carritoService.masIgv == 'S') {
        console.log('masIgv: SI');
        subtotal = this.tools.redondear(total_importe, 2)
        total_importe_con_descuentos = total_importe - montoDesc_original

        subtotal_descontado = this.tools.redondear(total_importe_con_descuentos, 2)
        igv_line = this.tools.redondear(subtotal_descontado * nigv, 2)
        montoDesc = subtotal - subtotal_descontado

        articulo.listaPrecios[0].monto = total_importe_con_descuentos;
        articulo.listaPrecios[0].montoMasIgv = total_importe_con_descuentos + igv_line;
        // articulo.listaPrecios[0].monto = total_importe_con_descuentos + igv_line;
        montoTotal = total_importe_con_descuentos + igv_line;

      } else {
        console.log('masIgv: NO');
        subtotal = this.tools.redondear(total_importe / (1 + nigv), 2)
        total_importe_con_descuentos = total_importe - montoDesc_original

        subtotal_descontado = this.tools.redondear(total_importe_con_descuentos / (1 + nigv), 2)
        igv_line = this.tools.redondear(subtotal_descontado * nigv, 2)
        montoDesc = subtotal - subtotal_descontado

        articulo.listaPrecios[0].monto = total_importe_con_descuentos
        articulo.listaPrecios[0].montoMasIgv = total_importe_con_descuentos;
        montoTotal = total_importe_con_descuentos;
      }


      let total: number = this.tools.redondear(montoTotal, 2)
      articulo.total_articulo = total;
      carritoSubTotal_SinDescuento += subtotal;
      carritoSubTotal_ConDescuento += subtotal_descontado;
      carritoIGV += igv_line;
      carritoMontoTotal += total;
      carritoMontoTotal_Descontado += montoDesc;


      arrDatos.push({
        Codigo: articulo.codigo,
        Nombre: articulo.nombre,
        Codigo_Unidad: articulo.listaPrecios[0].unidad,
        Factor: articulo.listaPrecios[0].factor,
        Cantidad_Kardex: articulo.cantidad * articulo.listaPrecios[0].factor,
        Cantidad: articulo.cantidad,
        Igv: igv_line,
        Unit: precioBase,
        Base_Imponible: subtotal_descontado,
        Base_Calculada: subtotal,
        Importe: total,
        Igv_Art: articulo.nigv,
        Precio_original: precioBase,
        Desc1: 0,
        Desc2: articulo.descuentoPromo === undefined ? 0 : articulo.descuentoPromo,
        Monto_Descuento: montoDesc,
        Stock_SN: 'S',
        Lote_SN: 'N',
        Lote_Numero: '',
        Lote_Vencimiento: '1900-01-01',
        Serie_SN: 'N',
        Serie_Numero: '',
        Barticulo: 'S',
        Origen_Punto_Venta: this.carritoService.documentoPendienteSeleccionado.Punto_Venta,
        Origen_Serie: this.carritoService.documentoPendienteSeleccionado.Codigo_Motivo_Serie,
        Origen_Numero: this.carritoService.documentoPendienteSeleccionado.Numero,
        Origen_NItem: articulo.nItemReferencia,
        Cantidad_presentacion: articulo.cantidad,
        Unidad_presentacion: articulo.listaPrecios[0].unidad,
        Nombre_presentacion: articulo.nombre,
        Precio_presentacion: precioBase,
        Codigo_Almacen: this.logins.ccod_almacen,
        Desc3: 0,
        Percepcion_sn: '',
        Percepcion_uni: 0,
        Perpecion_porc: 0,
        Boni_sn: '',
        BonItem_bonii_sn: '0',
        Desc4: 0,
        Peso: articulo.peso,
        Base_calculada_dec: subtotal,
        Base_imp_dec: subtotal_descontado,
        Igv_dec: igv_line,
        Importe_dec: total,
        Comision_porcentaje: 0,
        Comision_monto: 0,
        Codigo_presentacion: articulo.codigo,
      })
    })

    this.carritoService.carritoSubTotal_SinDescuento = carritoSubTotal_SinDescuento
    this.carritoService.carritoSubTotal_ConDescuento = carritoSubTotal_ConDescuento
    this.carritoService.carritoIGV = carritoIGV
    this.carritoService.carritoMontoTotal = carritoMontoTotal

    // this.carritoService.carritoMontoTotal_Descontado = carritoMontoTotal_Descontado
    if (this.carritoService.masIgv == 'S') {
      console.log('masIgv: SI');
      this.carritoService.carritoMontoTotal_Descontado = (carritoSubTotal_SinDescuento + carritoIGV) - carritoMontoTotal_Descontado
    } else {
      console.log('masIgv: NO');
      this.carritoService.carritoMontoTotal_Descontado = carritoMontoTotal_Descontado
    }

    return { filas_detalle: JSON.stringify(arrDatos) }
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

  modificarDireccion() {
    this.edicionCampo = true;
  }

  async cargarDocumentoPendiente(data: any){
    let idLoading: string = await this.tools.mostrarCargando('Consultando Documento')

    await this.pedidosService.consultarPedidioPendiente(data.Punto_Venta, data.Codigo_Motivo_Serie, data.Numero,).then(async(resp)=>{
     
      console.log(resp);
      let dataArticulo = [];
      resp.forEach(element => {
        dataArticulo.push({
          descuento: 0,
          cantidad: element.cantidad,
          codigo:   element.codigo,
          imgOriginal: element.imagen_1,
          nombre: element.nombre,
          moneda: element.moneda,
          nigv:   element.igv_art,
          cunidad: element.unidad,
          ERP_STOART: 0,
          precio: element.precio,
          factor: element.factor,
          Stock: 0,
          listaPrecios: [{
            codigoLista: element.codigo_lista,
            codigo: element.codigo,
            monto: element.importe,
            montoMasIgv: element.importe,
            precioOriginal: element.precio,
            precioLista: element.precio,
            unidad: element.unidad,
            desc1: 0,
            desc2: 0,
            desc3: 0,
            desc4: 0,
            factor: element.factor,
            otroDesc: 0
          }],
          listaPreciosRango: [],
          listaDescuentos: [],
          imagen_1: element.imagen_1,
          imagen_2: element.imagen_1,
          imagen_3: element.imagen_1,
          imagen_4: element.imagen_1,
          peso: '0.00',
          descuentoPromo: 0,
          descuento_maximo: 0,
          verificar_descuentos: 'N',
          descuento_monto_porcentaje: '',
          total_articulo: 0,
          check_bonificacion: false,
          nItemReferencia: element.nitem
        })
      });

      this.arrCarrito = dataArticulo;
      this.carritoService.arrCarrito = dataArticulo;
      this.carritoService.calcularMontoTotal();

      let dataCliente: Cliente = {
        ccod_empresa: resp[0].codigo_empresa,
        ccod_cliente: resp[0].codigo_cliente,
        cgrupo_cliente: '12',
        tipo_cliente: '',
        tip_doc: '',
        ndoc_id: resp[0].codigo_cliente,
        cnum_ruc: resp[0].codigo_cliente,
        cnum_dni: resp[0].codigo_cliente,
        cnom_cliente: resp[0].nombre_cliente,
        ctelefonos: '',
        ce_mail: '',
        cfax: '',
        cdireccion: resp[0].punto_llegada,
        lista_precios: resp[0].codigo_lista,
        nlinea_credito_mn: 0,
        nlinea_credito_me: 0,
        ccod_pais: '',
        ccod_departamento: resp[0].ccod_departamento,
        cdistrito: resp[0].cdistrito,
        cciudad: resp[0].cciudad,
        erp_nombres: '',
        erp_apepat: '',
        erp_apemat: '',
        nombre_comercial: '',
        ccod_zona: resp[0].ccod_zona,
        cnom_zona: resp[0].cnom_zona,
        cnom_distrito: resp[0].distrito,
        cnom_ciudad: resp[0].provicia,
        cnom_departamento: resp[0].departamento,
        nombre_lista_precio: resp[0].erp_nombre,
        situacion: '',
        forma_pagos: [],
        direcciones: [],
        agencias: [],
        lat: 0,
        lng: 0,
        imagen_1: null,
        imagen_2: null,
        imagen_3: null,
        imagen_4: null
      }

      await this.clienteService.clienteFormasPago(dataCliente.ccod_cliente).then((resp) => {
        dataCliente.forma_pagos = resp
      })
  
      await this.clienteService.clienteDirecciones(dataCliente.ccod_cliente).then((resp) => {
        dataCliente.direcciones = resp
      })
      await this.clienteService.clienteAgencias(dataCliente.ccod_cliente).then((resp) => {
        dataCliente.agencias = resp
      })

      this.carritoService.agregarCliente(dataCliente)
      console.log(this.carritoService.arrCarrito);
      this.pedidoForm.patchValue({'formaPago': resp[0].codigo_forma_pago})

      await this.tools.ocultarCargando(idLoading)
    });
  }

  ngOnDestroy(): void {
    console.log('Carrito destruido', this.subscricion);
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }
}
