import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
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

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute,
    public carritoService: CarritoService,
    private tools: ToolsService,
    private fb: FormBuilder,
    private logins: LoginService,
    private pedidoS: PedidosService,
    private artituloS: ArticuloService,
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
      fechaEntrega: [this.tools.fechaYHoraIso(), [Validators.required]],
      glosa: ['']
    })
    this.arrCarrito = this.carritoService.arrCarrito
    this.arrfiltroListaPrecio = this.carritoService.arrfiltroListaPrecio
    this.objCliente = this.carritoService.objCliente
    
    this.objVendedor = this.logins.objVendedor
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
    await this.tools.confirmarAlerta('Finalizar Pedido', 'warning').then((conf) => { estado = conf })
    if (!estado) return

    let idLoading: string = await this.tools.mostrarCargando('Creando Pedido')
    await this.carritoService.crearPedido(
      this.datosDetallePedido(),
      this.datosCabeceraPedido(form.value))
      .then(async (resp) => {
        await this.tools.ocultarCargando(idLoading)
        if (resp.estado) {
          this.isSelecArticulo = false;
          this.artituloS.setListaPrecioCliente('');
          this.tools.mostrarAlerta(`Pedido ${resp.codigo} Creado`, 'success', 4000)
          this.pedidoForm.reset({
            tipoDocumento: '',
            formaPago: '',
            fechaEntrega: this.tools.fechaYHoraIso(),
            glosa: ''
          }
          )
          this.borrarTodos()
          this.pedidoS.refresh()
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
    // let igv = this.tools.redondear(subTotal * 0.18,2) 
    // let total= subTotal+igv

    let subtotal_sin_igv: number = this.tools.redondear(subTotal / 1.18, 2)
    let igv: number = this.tools.redondear(subTotal - subtotal_sin_igv, 2)
    let total: number = subTotal

    return {
      // motivo:datos.tipoDocumento,
      motivo: '07',
      automatico: 'A',
      fecha_doc: this.tools.fechaYHora(),
      fecha_entr: datos.fecha,
      codigo_cliente: this.objCliente.ccod_cliente,
      nombre_cliente: this.objCliente.cnom_cliente,
      ruc_cliente: this.objCliente.cnum_ruc.length == 0 ? this.objCliente.cnum_dni : this.objCliente.cnum_ruc,
      forma_pago: datos.formaPago,
      vendedor_2: '00',
      moneda: 'S/',
      mas_igv: this.carritoService.masIgv, //'N',
      tipo_cambio: 'VTA',
      tasa_cambio: this.carritoService.tipoCambioVenta,
      importe: total,
      // tipo:'PEDIDO DIRECTO', //Falta tipo pedido
      tipo: 'PEDIDO DE PTOVTA', //Falta tipo pedido
      descuento: 0,
      numero_orden: '',
      lista_precios: this.objCliente.lista_precios,
      pais: this.objCliente.ccod_pais,
      codigo_agencia: '00',
      orden_trabajo: '00',
      numero_referencia: '',
      estado: 'Ingresado',
      atencion: 'Pendiente',
      porcentaje: '',
      atencion_prod: 'Pendiente',
      porcentaje_prod: '0%',
      aprobado: 'Sin Aprobacion',
      fecha_aprobacion: '0000-00-00 00:00:00',
      observacion_aprobacion: '',
      codigo_empleado_aprobacion: '00',
      codigo_transportista: '00',
      nombre_transportista: '',
      codigo_vehiculo: '00',
      pto_llegada: datos.direcciones,
      agencia_transporte: datos.agencias,
      // pto_llegada: this.objCliente.cdireccion,
      codigo_contacto: '00',
      nom_contacto: '00 - NINGUNO',
      motivo_traslado: '00',
      observacion: '',
      comentario2: '',
      comentario3: '',
      comentario4: '',
      comentario5: '',
      comentario6: '',
      comentario7: '',
      Pc_User: 'App movil',
      Pc_Ip: this.ip,
      erp_tipdoc: datos.tipoDocumento,
      comentario8: '',
      comentario1: '',
      observacion2: '',
      observacion3: '',
      observacion4: '',
      observacion5: '',
      observacion6: '',
      observacion7: '',
      observacion8: '',
      flag_ruta_contacto: 'N',
      ruta_contacto: 'NULL',
      erp_presupuesto: '00',
      erp_dscto_stock: 'S',
      erp_Dsubtotal: this.carritoService.carritoSubTotal_ConDescuento,
      erp_Ddescuento: this.carritoService.carritoMontoTotal_Descontado,
      erp_Digv: this.carritoService.carritoIGV,
      erp_Dimporte: this.carritoService.carritoMontoTotal,
      erp_Dpercepcion: 0,
      erp_Dtotal: this.carritoService.carritoMontoTotal,
      Glosa: datos.glosa,
      dias: this.objFormaPago.nro_dias,
      erp_gestor: '00',
      fecha_validez: this.tools.fechaYHora(),
      erp_contacto_vendedor: '00',
      subtotal_sin_descuentos: this.carritoService.carritoSubTotal_SinDescuento,
      numero_expediente1: '',
      numero_expediente2: '',
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

    return { filas_detalle: arrDatos }
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

}
