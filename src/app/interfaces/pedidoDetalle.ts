export interface PedidoDetalle {
    ccod_empresa?:          string;
    ccod_almacen?:          CcodAlmacen;
    idmotivo_venta?:        string;
    cnum_doc?:              string;
    nitem?:                 number;
    ccod_articulo?:         string;
    cnom_articulo?:         string;
    cunidad?:               Cunidad;
    factor?:                number;
    ncantidad?:             number;
    ncantidad3?:            number;
    nigv?:                  number;
    nprecio?:               number;
    base_imp?:              number;
    base_calculada?:        number;
    nimporte?:              number;
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

export enum CcodAlmacen {
    Cot = "COT",
    Empty = "",
    The001 = "001",
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
