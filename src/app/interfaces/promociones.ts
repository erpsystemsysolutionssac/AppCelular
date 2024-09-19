export interface Promociones {
    codigo_empresa?:        string;
    codigo_promocion?:      string;
    descripcion_promocion?: string;
    tipo_promocion?:        string;
    fecha_inicio?:          Date;
    fecha_vencimiento?:     Date;
    descuento?:             number;
    activo?:                boolean;
    promocionDetalle?:      PromocionDetalle[];
}

export interface PromocionDetalle {
    codigo_empresa?:   string;
    codigo_promocion?: string;
    tipo_promocion?:   string;
    codigo_articulo?:  string;
    nombre_articulo?:  string;
    descuento?:        number;
    unidad_articulo?:  string;
    activo?:           boolean;
}

