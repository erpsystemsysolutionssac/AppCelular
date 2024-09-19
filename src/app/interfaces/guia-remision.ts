export interface GuiaRemisionCabecera {
    ccod_empresa?:            string;
    cnum_serie?:          string;
    cnum_doc?:                string;
    ccod_almacen?:            CcodAlmacen;
    automatico?:              Automatico;
    dfecha_doc?:              Date;
    dfecha_entr?:             Date;
    ccod_cliente?:            string;
    cnom_cliente_v?:            string;
    cnum_ruc_cliente?:        string;
    ccod_forpago?:            string;
    ccod_person?:             Usuario;
    idvendedor2?:             Usuario;
    cmoneda?:                 Cmoneda;
    si_igv?:                  ERPDsctoStock;
    ctipo_cambio?:            CtipoCambio;
    tipo_cambio?:             number;
    nimporte?:                number;
    tipo_pedido?:             TipoPedido;
    dscto?:                   number;
    n_orden?:                 string;
    lista_precios?:           Usuario;
    pais?:                    CcodAlmacen;
    ccod_cencos?:             string;
    erp_codune?:              string;
    erp_codage?:              string;
    Ot?:                      Ot;
    cnum_docref?:             string;
    estado?:                  Estado;
    Atencion?:                Atencion;
    pto_llegada_02?:          string;
    porcentaje?:              string;
    Atencion_Prod?:           Atencion;
    porcentaje_prod?:         PorcentajeProd;
    aprobado?:                Aprobado;
    fecha_aprobacion?:        Date | PCFechaEnum;
    observacion_aprobacion?:  string;
    responsable_aprobacion?:  string;
    ccod_transportista?:      string;
    nombre_transp?:           string;
    ccod_vehiculo?:           string;
    punto_partida?:           PuntoPartida;
    lugar_entrega?:           string;
    ccod_contacto?:           string;
    nom_contacto?:            string;
    motivo_traslado?:         Usuario;
    observacion?:             string;
    comentario2?:             string;
    comentario3?:             string;
    comentario4?:             string;
    comentario5?:             string;
    comentario6?:             string;
    comentario7?:             string;
    Usuario?:                 Usuario;
    Pc_User?:                 PCUser;
    Pc_Fecha?:                Date | PCFechaEnum;
    Pc_Ip?:                   string;
    Erp_TipDoc?:              string;
    comentario8?:             string;
    titulo01?:                string;
    titulo02?:                string;
    titulo03?:                string;
    titulo04?:                string;
    titulo05?:                string;
    titulo06?:                string;
    titulo07?:                string;
    titulo08?:                string;
    erp_cod_dest?:            string;
    erp_nom_dest?:            string;
    erp_dir_dest?:            string;
    flag_ruta_contacto?:      ERPDsctoStock;
    ruta_contacto?:           RutaContacto;
    erp_presupuesto?:         Usuario;
    erp_dscto_stock?:         ERPDsctoStock;
    erp_Dsubtotal?:           number;
    erp_Ddescuento?:          number;
    erp_Digv?:                number;
    erp_Dimporte?:            number;
    erp_Dpercepcion?:         number;
    erp_Dtotal?:              number;
    erp_glosa?:               string;
    erp_dias?:                number;
    erp_gestor?:              string;
    dfecha_val?:              Date;
    erp_dfecha_val?:          Date;
    erp_contacto_vendedor?:   Usuario;
    subtotal_sin_descuentos?: number;
    erp_nro_exp?:             string;
    erp_nro_exp2?:            string;
    nombre_almacen?:          string;
    nombre_centro_costo?:     string;
    nombre_motivo?:           string;
    nombre_vendedor?:         string;
    nombre_forPago?:          string;
    lat?:                     number|null;
    lng?:                     number|null;
    ruta_pdf?:                string;
}

export enum Atencion {
    Atendido = "Atendido",
    Pendiente = "Pendiente",
    Proceso = "Proceso",
}

export enum Ot {
    The00 = "00",
    The001 = "001",
    The002 = "002",
    The201300001 = "2013-00001",
}

export enum PCFechaEnum {
    The00000000000000 = "0000-00-00 00:00:00",
}

export enum PCUser {
    AppMovil = "App movil",
    Empty = "",
}

export enum Usuario {
    Admin = "Admin",
    Came1 = "came1",
    Empty = "",
    Erpsys = "erpsys",
    Invitado = "INVITADO",
    The00 = "00",
    The01 = "01",
}

export enum Aprobado {
    Aprobado = "Aprobado",
    Desaprobado = "Desaprobado",
    SinAprobacion = "Sin Aprobacion",
}

export enum Automatico {
    A = "A",
}

export enum CcodAlmacen {
    Empty = "",
    The001 = "001",
    The007 = "007",
    The019 = "019",
}

export enum Cmoneda {
    S = "S/",
}

export enum CtipoCambio {
    Vta = "VTA",
}

export enum ERPDsctoStock {
    N = "N",
    S = "S",
}

export enum Estado {
    Anulado = "Anulado",
    Ingresado = "Ingresado",
    Modificado = "Modificado",
}

export enum PorcentajeProd {
    The0 = "0%",
}

export enum PuntoPartida {
    AVCaminosDelInca386Surco = "Av. Caminos del Inca 386 Surco",
    AVLaCamelias877LimaLimaSANMiguel = "AV. LA CAMELIAS 877 - LIMA - LIMA - SAN MIGUEL",
    CalleJoseMartirOlaya169Ofic506 = "CALLE JOSE MARTIR OLAYA 169 OFIC.  506",
    LAVLaCamelias877LimaLimaSANMiguel = "L: AV. LA CAMELIAS 877 - LIMA - LIMA - SAN MIGUEL",
}

export enum RutaContacto {
    Null = "NULL",
}

export enum TipoPedido {
    PedidoDeCotizacion = "PEDIDO DE COTIZACION",
    PedidoDePtovta = "PEDIDO DE PTOVTA",
    PedidoDirecto = "PEDIDO DIRECTO",
}

export interface GuiaRemisionDetalle {
    ccod_empresa?:          string;
    ccod_almacen?:          CcodAlmacen;
    idmotivo_venta?:        string;
    cnum_doc?:              string;
    nitem?:                 number;
    ccod_articulo?:         string;
    CNOM_ARTICULO?:         string;
    CUNIDAD?:               Cunidad;
    factor?:                number;
    NCANTIDAD?:             number;
    ncantidad3?:            number;
    nigvcalc?:                  number;
    nprecio?:               number;
    NBASEIMPON?:              number;
    base_calculada?:        number;
    NPRECIO_IMPORTE?:              number;
    igv_art?:               number;
    precio_original?:       number;
    porc_descuento?:        number;
    desc2?:                 number;
    monto_descuento?:       number;
    blote?:                 Barticulo;
    cnro_lote?:             string;
    vcto?:                  Date | VctoEnum;
    bserie?:                Barticulo;
    cnro_serie?:            string;
    barticulo?:             Barticulo;
    ptovta_cotizacion?:     CcodAlmacen;
    idmotivo_cotizacion?:   IdmotivoCotizacion;
    numero_cotizacion?:     string;
    nitem_ref?:             number;
    cantidad_presentacion?: number;
    unidad_presentacion?:   Cunidad;
    nombre_presentacion?:   string;
    precio_presentacion?:   number;
    ccencos?:               Ccencos;
    ot?:                    CcodAlmacenOrg;
    erp_codune?:            CcodAlmacenOrg;
    erp_codage?:            string;
    bonificacion?:          Barticulo;
    largo?:                 number;
    ancho?:                 number;
    ccod_almacen_org?:      CcodAlmacenOrg;
    desc3?:                 number;
    erp_percepcion_sn?:     Barticulo;
    erp_percepcion_uni?:    number | null;
    erp_percepcion_porc?:   number | null;
    Cod_Referencia?:        string;
    Bon_Pro?:               string;
    ItemBon?:               number;
    erp_boni_sn?:           string;
    erp_promo_sn?:          string;
    erp_item_boni?:         number;
    erp_presupuesto?:       Cunidad;
    erp_desc4?:             number | null;
    erp_peso?:              number | null;
    erp_base_calc_dec?:     number;
    erp_base_imp_dec?:      number;
    erp_igv_dec?:           number;
    erp_importe_dec?:       number;
    erp_comision_porc?:     number;
    erp_comision_monto?:    number;
    erp_lpn?:               string;
    codigo_presentacion?:   string;
    cantidad_atendida?:     number | null;
}

export enum Barticulo {
    Empty = "",
    N = "N",
    S = "S",
}

export enum Ccencos {
    Empty = "",
    The00 = "00",
    The01 = "01",
    The010002 = "010002",
    The010003 = "010003",
    The0101001 = "0101001",
    The0101003 = "0101003",
    The0101005 = "0101005",
    The0101010 = "0101010",
    The0201001 = "0201001",
}


export enum CcodAlmacenOrg {
    Empty = "",
    The00 = "00",
    The001 = "001",
    The002 = "002",
    The010 = "010",
    The201300001 = "2013-00001",
}

export enum Cunidad {
    Bo = "BO",
    Cja = "CJA",
    Dh = "DH",
    Empty = "",
    Frac = "FRAC",
    Kg = "KG",
    M3 = "M3",
    Pza = "pza",
    The00 = "00",
    Und = "UND",
}

export enum IdmotivoCotizacion {
    Empty = "",
    The022 = "022",
    The05 = "05",
}

export enum VctoEnum {
    The00000000000000 = "0000-00-00 00:00:00",
}




