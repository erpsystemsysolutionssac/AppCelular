import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GuiaRemisionComponent } from './guia-remision.component';

import { ArticuloComponent } from 'src/app/submenu/guiaRemision/articulo/articulo.component';
import { PromocionesComponent } from 'src/app/submenu/guiaRemision/promociones/promociones.component';
import { VerMasComponent } from 'src/app/submenu/guiaRemision/ver-mas/ver-mas.component';
import { GuiasComponent } from 'src/app/submenu/guiaRemision/guias/guias.component';
import { GuiaComponent } from 'src/app/submenu/guiaRemision/guia/guia.component';

import { ListaArticulosComponent } from 'src/app/submenu/components/lista-articulos/lista-articulos.component';
import { ListaPreciosComponent } from 'src/app/submenu/components/lista-precios/lista-precios.component';
import { ListaClientesComponent } from 'src/app/submenu/components/lista-clientes/lista-clientes.component';
import { ClienteComponent } from 'src/app/submenu/mantenimientos/cliente/cliente.component';
import { ListaAgenciasTransporteComponent } from 'src/app/submenu/components/lista-agencias-transporte/lista-agencias-transporte.component';
import { AgenciaComponent } from 'src/app/submenu/mantenimientos/agencia/agencia.component';
import { CarritoV2Component } from 'src/app/submenu/guiaRemision/carrito-v2/carrito-v2.component';
import { VendedorComponent } from 'src/app/submenu/mantenimientos/vendedor/vendedor.component';

const routes: Routes = [
  {
    path: '',
    component: GuiaRemisionComponent,
    children: [
      { path: '', redirectTo: 'articulos', pathMatch: 'full'},
      { path: 'articulos', component: ListaArticulosComponent, },
      { path: 'articulos/:cod', component: ArticuloComponent, },
      { path: 'promociones', component: PromocionesComponent, },
      { path: 'listaPrecios', component: ListaPreciosComponent, },
      { path: 'guias', component: GuiasComponent },
      { path: 'guias/:motivo/:numeroDocumento', component: GuiaComponent },
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
export class GuiaRemisionRoutingModule { }
