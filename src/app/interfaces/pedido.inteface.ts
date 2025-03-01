export interface PedidoDetallado {
    documento_nombre:                          string;
    documento_tipo:                            string;
    documento_punto_venta_codigo:              string;
    documento_punto_venta_nombre:              string;
    documento_motivo_venta_codigo:             string;
    documento_numero:                          string;
    documento_motivo_compra_codigo:            string;
    documento_nombre_motivo_tramite:           string;
    Documento_Ejercicio:                       string;
    Documento_Periodo:                         string;
    carpeta_formato:                           string;
    documento_formato:                         string;
    empresa_codigo:                            string;
    empresa_ruc:                               string;
    documento_ejercicio:                       string;
    documento_periodo:                         string;
    carpeta_pdf:                               string;
    nombre_pdf:                                string;
    documento_fecha:                           Date;
    documento_fecha_entrega:                   Date;
    documento_fecha_validez:                   Date;
    documento_fecha_formato_impresion:         string;
    documento_fecha_entrega_formato_impresion: string;
    documento_fecha_validez_formato_impresion: string;
    documento_fecha_formato_servidor:          Date;
    documento_fecha_entrega_formato_servidor:  Date;
    documento_fecha_validez_formato_servidor:  Date;
    documento_moneda:                          string;
    documento_nimporte:                        number;
    documento_forma_pago_codigo:               string;
    Codigo_Cliente:                            string;
    cliente_nombre:                            string;
    cliente_ruc:                               string;
    documento_estado:                          string;
    documento_mas_igv:                         string;
    nombre_tipo_cambio:                        string;
    tipo_cambio:                               number;
    documento_lista_precios:                   string;
    documento_aprobacion_estado:               string;
    documento_aprobacion_fecha:                Date;
    documento_aprobacion_codigo_responsable:   string;
    documento_aprobacion_comentario:           string;
    documento_firma_Aprobacion1:               string;
    Comentario02:                              string;
    documento_cencos_codigo:                   string;
    documento_cencos_nombre:                   string;
    documento_descuento_porc:                  number;
    documento_ot_codigo:                       string;
    documento_ot_nombre:                       string;
    documento_punto_llegada:                   string;
    direcciones_alternativas1:                 string;
    documento_dias:                            number;
    cliente_pais:                              string;
    documento_atencion_estado:                 string;
    documento_atencion_porcentaje:             string;
    cliente_contacto_codigo:                   string;
    cliente_contacto_cargo:                    string;
    documento_vendedor1:                       string;
    documento_vendedor1_nombre:                string;
    documento_vendedor1_nombre2:               string;
    documento_firma_vendedor:                  string;
    documento_vendedor1_cargo:                 string;
    documento_firma_responsable:               string;
    documento_vendedor2:                       string;
    documento_vendedor2_nombre:                string;
    documento_glosa:                           string;
    cliente_agencia:                           string;
    usuario_codigo:                            string;
    pc_user:                                   string;
    pc_fecha:                                  Date;
    pc_ip:                                     string;
    presupuesto_codigo:                        string;
    documento_subtotal_sin_descuentos:         number;
    documento_descuento:                       number;
    documento_subtotal:                        number;
    documento_igv:                             number;
    documento_importe:                         number;
    documento_percepcion:                      number;
    documento_total:                           number;
    gestor_codigo:                             string;
    documento_referencia_motivo_codigo:        string;
    documento_total_productos:                 number;
    cliente_contacto_nombre:                   string;
    unidad_negocio_codigo:                     string;
    codigo_transportista:                      string;
    codigo_vehiculo:                           string;
    motivo_traslado:                           string;
    documento_numero_referencia:               string;
    documento_numero_orden:                    string;
    documento_automatico:                      string;
    numero_expediente1:                        string;
    numero_expediente2:                        string;
    codigo_agencia_transporte:                 string;
    documento_aprobado:                        string;
    Comentario01:                              string;
    Documento_RutaPDF:                         string;
    Documento_placas_cliente:                  string;
    documento_codigo_cliente_2:                string;
    documento_nombre_cliente_2:                string;
    documento_direccion_cliente_2:             string;
    documento_codigo_chofer:                   string;
    cliente_direccion:                         string;
    cliente_telefono:                          string;
    cliente_fax:                               string;
    cliente_correo:                            string;
    pais_cliente:                              string;
    documento_cliente_contacto_telefono1:      string;
    forma_pago_nombre:                         string;
    documento_credito_contado:                 string;
    documento_total_letras:                    string;
    detalle_orden:                             number;
    articulo_codigo:                           string;
    articulo_nombre:                           string;
    articulo_unidad:                           string;
    articulo_unidad_kardex:                    string;
    articulo_cubitaje:                         number;
    articulo_peso:                             number;
    articulo_igv_porcentaje:                   number;
    articulo_factor:                           number;
    articulo_kardex:                           number;
    articulo_cantidad:                         number;
    articulo_precio:                           number;
    articulo_igv:                              number;
    articulo_descuentosuma:                    number;
    articulo_descuento1:                       number;
    articulo_descuento2:                       number;
    articulo_barticulo:                        string;
    articulo_presentacion_codigo:              string;
    articulo_presentacion_cantidad:            number;
    articulo_presentacion_nombre:              string;
    articulo_presentacion_unidad:              string;
    articulo_presentacion_precio:              number;
    articulo_presentacion_importe:             number;
    articulo_base_imponible:                   number;
    articulo_base_calculada:                   number;
    articulo_monto_descuento:                  number;
    articulo_importe:                          number;
    articulo_precio_original:                  number;
    articulo_descuento3:                       number;
    articulo_percepcion_sn:                    string;
    articulo_percepcion_uni:                   number;
    articulo_percepcion_porc:                  number;
    articulo_descuento4:                       number;
    articulo_almacen_codigo:                   string;
    articulo_base_calculada_dec:               number;
    articulo_base_imponible_dec:               number;
    articulo_igv_dec:                          number;
    articulo_importe_dec:                      number;
    articulo_comision_porc:                    number;
    articulo_comision_monto:                   number;
    documento_nombre_equivalencia:             null;
    documento_unid_equivalencia:               null;
    documento_factor_equivalencia:             null;
    Pais:                                      string;
    Departamento:                              string;
    Ciudad:                                    string;
    Distrito:                                  string;
    nombre_lista_precio:                       string;
    articulo_marca:                            string;
    articulo_cod_interno:                      string;
    empresa_razon_social:                      string;
    empresa_ruta_logo:                         string;
    empresa_logo:                              string;
    empresa_cuenta1:                           string;
    empresa_cuenta2:                           string;
    empresa_telefono:                          string;
    empresa_web:                               string;
    empresa_direccion:                         string;
    empresa_correo:                            string;
    documento_nombre_agencia_cliente:          null;
    documento_nombre_agencia:                  string;
    documento_direccion_agencia:               string;
    documento_observacion1_agencia:            null;
    documento_observacion2_agencia:            null;
    documento_ruc_agencia:                     null;
    documento_tipo_movimiento:                 string;
}