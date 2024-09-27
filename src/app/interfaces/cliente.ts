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
    codigoUbigeo?:      string;
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