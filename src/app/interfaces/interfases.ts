export interface Ubigeo {
    Codigo: string;
    Nombre: string;
}

export interface Articulo {
    descuento?:     number;
    cantidad?:     number;
    codigo?:       string;
    imgOriginal?:  string;
    nombre?:       string;
    moneda?:       Moneda;
    nigv?:         number;
    cunidad?:      string;
    ERP_STOART?:   number;
    precio?:       number;
    factor?:       number;
    Stock?:        number;
    listaPrecios?: ListaPrecio[];
    listaPreciosRango?: listaPreciosRango[];
    listaDescuentos?: listaDescuentos[];
    imagen_1?:     string|null;
    imagen_2?:     string|null;
    imagen_3?:     string|null;
    imagen_4?:     string|null;
    peso?:     string|null;
    descuentoPromo?:      number|undefined;
    descuento_maximo?:      number|undefined;
    verificar_descuentos?:      string|undefined;
    descuento_monto_porcentaje?: string|undefined;
    total_articulo?:      number|undefined;
    check_bonificacion?: boolean|undefined;
    nItemReferencia?: number|undefined;
}

export interface ListaPrecio {
    codigoLista?: string;
    codigo?:      string;
    monto?:       number;
    montoMasIgv?:       number;
    precioOriginal?:       number;
    precioLista?: number;
    unidad?:      string;
    desc1?:       number;
    desc2?:       number;
    desc3?:       number;
    desc4?:       number;
    factor?:      number;
    otroDesc?: number;
}

export interface listaPreciosRango {
    codigoLista?: string;
    codigo?:      string;
    monto?:       number;
    precioOriginal?:       number;
    unidad?:      string;
    desc1?:       number;
    desc2?:       number;
    desc3?:       number;
    desc4?:       number;
    factor?:      number;
    minimo?:      number;
    maximo?:      number;
}

export interface listaDescuentos{
    codigo?:      string;
    unidad?:      string;
    minimo?:      number;
    maximo?:      number;
    descuento?:      number;
}

export interface ListaPrecioElement {
    codigoLista?:    string;
    codigo?:         string;
    monto?:          number;
    precioOriginal?: number;
    unidad?:         string;
    desc1?:          number;
    desc2?:          number;
    desc3?:          number;
    desc4?:          number;
    factor?:         number;
    rango?:          Rango | null;
    minimo?:         number | null;
    maximo?:         number | null;
}

export enum Rango {
    S = "S",
}

export enum Moneda {
    Empty = "$",
    S = "S/",
}

export interface Cliente {
    ccod_empresa?:      string;
    ccod_cliente?:      string;
    cgrupo_cliente?:    string;
    tipo_cliente?:      string;
    tip_doc?:           string;
    ndoc_id?:           string;
    cnum_ruc?:          string;
    cnum_dni?:          string;
    cnom_cliente?:      string;
    ctelefonos?:        string;
    ce_mail?:           string;
    cfax?:              string;
    cdireccion?:        string;
    lista_precios?:     string;
    nlinea_credito_mn?: number;
    nlinea_credito_me?: number;
    ccod_pais?:         string;
    ccod_departamento?: string;
    cdistrito?:         string;
    cciudad?:           string;
    erp_nombres?:       string;
    erp_apepat?:        string;
    erp_apemat?:        string;
    nombre_comercial?:        string;
    ccod_zona?: string;
    cnom_zona?: string;
    cnom_distrito?: string;
    cnom_ciudad?: string;
    cnom_departamento?: string;
    nombre_lista_precio?: string;
    situacion?: string;
    lat?:               number | null;
    lng?:               number | null;
    forma_pagos?:       FormaPago[];
    direcciones?:       Direcciones[];
    agencias? :         Agencias[];
    imagen_1?:          string|null;
    imagen_2?:          string|null;
    imagen_3?:          string|null;
    imagen_4?:          string|null;
}

export interface FormaPago {
    ccod_forpago?:  string;
    n_item?:        number;
    selec?:         string;
    tipo?:          string;
    cnom_forpago?:  string;
    nro_dias?:      number;
    nro_letras?:    number;
}

export interface Direcciones {
    codigo?:        string;
    direccion?:     string;
}

export interface Agencias {
    codigo?:        string;
    nombre?:     string;
}

export interface Vendedor {
    ccod_vendedor?: string;
    cnom_vendedor?: string;
    erp_cargo?:     string;
    ccod_usuario?:  string;
    email?:         string;
    celular?:       string;
    telefono1?:     string;
    porcentaje_descuento?: number;
}

export interface filtroListaPrecio {
    lista_precio?: string;
}

export interface dataBonificado {
    codigo_articulo: string, 
    fecha: string,
    listaPrecio: string, 
    monedaDocumento: string, 
    tipoCambio: number, 
    puntoVenta: string,
    cantidad_articulo: number
}