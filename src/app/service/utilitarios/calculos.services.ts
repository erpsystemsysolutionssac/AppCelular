import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class CalculosService {


    constructor(
        // private toolsService: ToolsService, 
        // private http: HttpClient, 
        // private loginS: LoginService
    ) {

    }

  calcular_totales_ventas(agregar_igv: boolean, cantidad: number, precio_unitario: number, igv_articulo: number, icbper_articulo: number, descuento1: number, descuento2: number, descuento3: number, descuento4: number, extranjero: boolean, tipo_descuento: string, descuento_bc_bi: string) {
    const decimales_precio = 2;

    isNaN(icbper_articulo) ? icbper_articulo = 0 : "";
    isNaN(descuento1) ? descuento1 = 0 : "";
    isNaN(descuento2) ? descuento2 = 0 : "";
    isNaN(descuento3) ? descuento3 = 0 : "";
    isNaN(descuento4) ? descuento4 = 0 : "";
    const _tipo_descuento = tipo_descuento || 'P'
    const _descuento_bc_bi = descuento_bc_bi || 'BC'

    if (extranjero) igv_articulo = 0;
    //El descuento se aplicará al subTotal
    //El descuento_cabecera será el primero en hacer efecto
    var calcular_totales = {
        Precio_Sin_Igv: 0,
        SubTotal_Sin_Descuentos: 0,
        Descuentos_SubTotal: 0,
        SubTotal_Con_Descuentos: 0,
        Igv: 0,
        ICBPER: 0,
        Total: 0
    };

    var Unit = 0, SubTotal_Sin_Descuentos = 0, descuento, Descuentos_SubTotal = 0, SubTotal_Con_Descuentos = 0, Igv = 0, ICBPER = 0, Total = 0;

    if (_tipo_descuento == "P") {
        descuento1 = descuento1 / 100;
        descuento2 = descuento2 / 100;
        descuento3 = descuento3 / 100;
        descuento4 = descuento4 / 100;
    } else {
        descuento1 = descuento1;
        descuento2 = descuento2;
        descuento3 = descuento3;
        descuento4 = descuento4;
    }
    igv_articulo = igv_articulo / 100;

    Unit = precio_unitario;

    ICBPER = icbper_articulo * cantidad;
    if (!agregar_igv) {
        var nuevo_igv_articulo = 1 + igv_articulo * 1;
        Unit = Unit / nuevo_igv_articulo;
    }
    SubTotal_Sin_Descuentos = Unit * cantidad;

    SubTotal_Con_Descuentos = SubTotal_Sin_Descuentos;
    console.log(SubTotal_Sin_Descuentos, _descuento_bc_bi, Unit, cantidad, agregar_igv);
    if (_descuento_bc_bi == "TO") {

        Igv = SubTotal_Sin_Descuentos * igv_articulo;

        Total = SubTotal_Sin_Descuentos + Igv;

        if (_tipo_descuento == "P") {
            //1er descuento
            descuento = Total * descuento1;
            Total = Total - descuento;
            Descuentos_SubTotal += descuento * 1;
            //2do descuento
            descuento = Total * descuento2;
            Total = Total - descuento;
            Descuentos_SubTotal += descuento * 1;

            //3er descuento
            descuento = Total * descuento3;
            Total = Total - descuento;
            Descuentos_SubTotal += descuento * 1;

            //4to descuento
            descuento = Total * descuento4;
            Total = Total - descuento;
            Descuentos_SubTotal += descuento * 1;
        } else {
            //1er descuento
            Total = Total - descuento1;
            Descuentos_SubTotal += descuento1 * 1;
            //2do descuento
            Total = Total - descuento2;
            Descuentos_SubTotal += descuento2 * 1;

            //3er descuento
            Total = Total - descuento3;
            Descuentos_SubTotal += descuento3 * 1;

            //4to descuento
            Total = Total - descuento4;
            Descuentos_SubTotal += descuento4 * 1;
        }

        SubTotal_Con_Descuentos = Total / (1 + (igv_articulo * 1))
        Igv = Total - SubTotal_Con_Descuentos
        SubTotal_Sin_Descuentos = SubTotal_Con_Descuentos - Descuentos_SubTotal
        Total = Total + ICBPER

        if (Total < 0) {
            Total = 0;
        }
        if (Igv < 0) {
            Igv = 0;
        }
        if (ICBPER <= 0) {
            ICBPER = 0;
        }
        if (SubTotal_Sin_Descuentos <= 0) {
            SubTotal_Sin_Descuentos = 0;
        }
        if (Descuentos_SubTotal <= 0) {
            Descuentos_SubTotal = 0;
        }
        if (SubTotal_Con_Descuentos <= 0) {
            SubTotal_Con_Descuentos = 0;
        }
    } else {

        if (_tipo_descuento == "P") {
            //1er descuento
            descuento = SubTotal_Con_Descuentos * descuento1;
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento;
            Descuentos_SubTotal += descuento;
            //2do descuento
            descuento = SubTotal_Con_Descuentos * descuento2;
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento;
            Descuentos_SubTotal += descuento;

            //3er descuento
            descuento = SubTotal_Con_Descuentos * descuento3;
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento;
            Descuentos_SubTotal += descuento;

            //4to descuento
            descuento = SubTotal_Con_Descuentos * descuento4;
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento;
            Descuentos_SubTotal += descuento;
        } else {
            //1er descuento
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento1;
            Descuentos_SubTotal += descuento1;
            //2do descuento
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento2;
            Descuentos_SubTotal += descuento2;

            //3er descuento
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento3;
            Descuentos_SubTotal += descuento3;

            //4to descuento
            SubTotal_Con_Descuentos = SubTotal_Con_Descuentos - descuento4;
            Descuentos_SubTotal += descuento4;
        }

        Igv = SubTotal_Con_Descuentos * igv_articulo;

        if (Igv < 0) {
            Igv = 0;
        }
        if (ICBPER <= 0) {
            ICBPER = 0;
        }
        if (SubTotal_Sin_Descuentos <= 0) {
            SubTotal_Sin_Descuentos = 0;
        }
        if (Descuentos_SubTotal <= 0) {
            Descuentos_SubTotal = 0;
        }
        if (SubTotal_Con_Descuentos <= 0) {
            SubTotal_Con_Descuentos = 0;
        }

        Total = SubTotal_Con_Descuentos + Igv + ICBPER;
    }

    calcular_totales.Precio_Sin_Igv = Unit;
    calcular_totales.SubTotal_Sin_Descuentos = SubTotal_Sin_Descuentos;
    calcular_totales.Descuentos_SubTotal = Descuentos_SubTotal;
    calcular_totales.SubTotal_Con_Descuentos = SubTotal_Con_Descuentos;
    calcular_totales.Igv = Igv;
    calcular_totales.ICBPER = ICBPER;
    calcular_totales.Total = Total;

    return calcular_totales;
}
}
