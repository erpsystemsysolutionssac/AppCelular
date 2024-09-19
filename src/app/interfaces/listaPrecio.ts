export interface ListaPrecioRango {
    Codigo?:     string;
    Nombre?:     string;
    Interno?:    string;
    Unidad?:     string;
    Stock?:      number;
    Costo?:      number;
    LP1?:        number | null;
    LP2?:        number | null;
    LP3?:        number | null;
    LP4?:        number | null;
    LP5?:        number | null;
    LP6?:        number | null;
    LP7?:        number | null;
    Familia?:    string;
    Subfamilia?: string;
    Concepto1?:  string;
    Concepto2?:  string;
    Concepto3?:  string;
    Concepto4?:  string;
    Concepto5?:  string;
    Concepto6?:  string;
    Concepto7?:  string;
    Leyenda01?:  string;
    Leyenda02?:  string;
    Factor?:     number;
}