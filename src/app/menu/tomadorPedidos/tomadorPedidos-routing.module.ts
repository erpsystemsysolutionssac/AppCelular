import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListaArticulosComponent } from 'src/app/submenu/components/lista-articulos/lista-articulos.component';
import { ListaClientesComponent } from 'src/app/submenu/components/lista-clientes/lista-clientes.component';
import { ClienteComponent } from 'src/app/submenu/mantenimientos/cliente/cliente.component';
import { CarritoV2Component } from 'src/app/submenu/tomadorPedidos/carrito-v2/carrito-v2.component';
import { PedidoComponent } from 'src/app/submenu/tomadorPedidos/pedido/pedido.component';
import { PedidosComponent } from 'src/app/submenu/tomadorPedidos/pedidos/pedidos.component';
import { PromocionesComponent } from 'src/app/submenu/tomadorPedidos/promociones/promociones.component';
import { VerMasComponent } from 'src/app/submenu/tomadorPedidos/ver-mas/ver-mas.component';

import { TomadorPedidosComponent } from './tomadorPedidos.component';
import { ListaPreciosComponent } from 'src/app/submenu/components/lista-precios/lista-precios.component';
import { ListaAgenciasTransporteComponent } from 'src/app/submenu/components/lista-agencias-transporte/lista-agencias-transporte.component';
import { AgenciaComponent } from 'src/app/submenu/mantenimientos/agencia/agencia.component';
import { VendedorComponent } from 'src/app/submenu/mantenimientos/vendedor/vendedor.component';
import { ArticuloComponent } from 'src/app/submenu/mantenimientos/articulo/articulo.component';


const routes: Routes = [
  {
    path: '',
    component: TomadorPedidosComponent,
    children: [
      {
        path: '',
        redirectTo: 'articulos',
        pathMatch: 'full'
      },
      {
        path: 'articulos',
        component: ListaArticulosComponent
      },
      {
        path: 'articulos/:cod',
        component: ArticuloComponent,
      },
      {
        path: 'promociones',
        component: PromocionesComponent,
      },
      {
        path: 'listaPrecios',
        component: ListaPreciosComponent
      },
      {
        path: 'pedidos',
        component: PedidosComponent
      },
      {
        path: 'pedidos/:puntoVenta/:motivo/:cod',
        component: PedidoComponent
      },
      {
        path: 'clientes',
        component: ListaClientesComponent
      },
      {
        path: 'clientes/:ccod_cliente',
        component: ClienteComponent
      },
      {
        path: 'carrito',
        component: CarritoV2Component
      },
      {
        path: 'vendedor',
        component: VendedorComponent
      },
      {
        path: 'agenciasTransportes',
        component: ListaAgenciasTransporteComponent
      },
      {
        path: 'agenciasTransportes/:evento/:ccod_agencia',
        component: AgenciaComponent
      },
      {
        path: 'verMas/:random',
        component: VerMasComponent
      },
      {
        path: '**',
        redirectTo: 'articulos'
      }
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TomadorPedidosRoutingModule { }
