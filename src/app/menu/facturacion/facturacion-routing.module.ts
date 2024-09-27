import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FacturacionComponent } from './facturacion.component';
import { ListaArticulosComponent } from 'src/app/submenu/components/lista-articulos/lista-articulos.component';
import { ArticuloComponent } from 'src/app/submenu/mantenimientos/articulo/articulo.component';
import { PromocionesComponent } from 'src/app/submenu/facturacion/promociones/promociones.component';
import { ListaPreciosComponent } from 'src/app/submenu/components/lista-precios/lista-precios.component';
import { ListaFacturaComponent } from 'src/app/submenu/facturacion/lista-factura/lista-factura.component';
import { FacturaComponent } from 'src/app/submenu/facturacion/factura/factura.component';
import { ListaClientesComponent } from 'src/app/submenu/components/lista-clientes/lista-clientes.component';
import { ClienteComponent } from 'src/app/submenu/mantenimientos/cliente/cliente.component';
import { CarritoV2Component } from 'src/app/submenu/facturacion/carrito-v2/carrito-v2.component';
import { VendedorComponent } from 'src/app/submenu/mantenimientos/vendedor/vendedor.component';
import { ListaAgenciasTransporteComponent } from 'src/app/submenu/components/lista-agencias-transporte/lista-agencias-transporte.component';
import { AgenciaComponent } from 'src/app/submenu/mantenimientos/agencia/agencia.component';
import { VerMasComponent } from 'src/app/submenu/facturacion/ver-mas/ver-mas.component';



const routes: Routes = [
  {
    path: '',
    component: FacturacionComponent,
    children: [
      { path: '', redirectTo: 'articulos', pathMatch: 'full'},
      { path: 'articulos', component: ListaArticulosComponent, },
      { path: 'articulos/:cod', component: ArticuloComponent, },
      { path: 'promociones', component: PromocionesComponent, },
      { path: 'listaPrecios', component: ListaPreciosComponent, },
      { path: 'facturas', component: ListaFacturaComponent },
      { path: 'factura/:motivo/:numeroDocumento', component: FacturaComponent },
      { path: 'clientes', component: ListaClientesComponent, },
      { path: 'clientes/:ccod_cliente', component: ClienteComponent },
      { path: 'carrito', component: CarritoV2Component, },
      { path: 'vendedor', component: VendedorComponent },
      { path: 'agenciasTransportes', component: ListaAgenciasTransporteComponent },
      { path: 'agenciasTransportes/:evento/:ccod_agencia', component: AgenciaComponent },
      { path: 'verMas/:random', component: VerMasComponent },
      { path: '**', redirectTo: 'articulos' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacturacionRoutingModule { }
