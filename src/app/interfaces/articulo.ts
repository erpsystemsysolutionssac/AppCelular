export interface Articulo {
    descuento?:     number;
    cantidad?:     number;
    codigo?:       string;
    imgOriginal?:  string;
    nombre?:       string;
    moneda?:       string;
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
    peso?:     number;
    descuentoPromo?:      number|undefined;
    descuento_maximo?:      number|undefined;
    verificar_descuentos?:      string|undefined;
    descuento_monto_porcentaje?: string|undefined;
    total_articulo?:      number|undefined;
    check_bonificacion?: boolean|undefined;
    nItemReferencia?: number|undefined;
    tipo_vista_precio_producto?:     string|null;
    mas_igv_precio_producto?:     string|null;
    estado_rango?: string|null;
    descuento3?: number|null;
    check_descuento3?: boolean|undefined;
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