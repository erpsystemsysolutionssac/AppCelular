import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgenciaFormComponent } from 'src/app/submenu/tomadorPedidos/agencia-form/agencia-form.component';
import { AgenciasTransportesComponent } from 'src/app/submenu/tomadorPedidos/agencias-transportes/agencias-transportes.component';
import { ArticuloComponent } from 'src/app/submenu/tomadorPedidos/articulo/articulo.component';
import { ArticulosComponent } from 'src/app/submenu/tomadorPedidos/articulos/articulos.component';
import { CarritoComponent } from 'src/app/submenu/tomadorPedidos/carrito/carrito.component';
import { ClienteComponent } from 'src/app/submenu/tomadorPedidos/cliente/cliente.component';
import { ClientesComponent } from 'src/app/submenu/tomadorPedidos/clientes/clientes.component';
import { ListaPreciosComponent } from 'src/app/submenu/tomadorPedidos/lista-precios/lista-precios.component';
import { PedidoComponent } from 'src/app/submenu/tomadorPedidos/pedido/pedido.component';
import { PedidosComponent } from 'src/app/submenu/tomadorPedidos/pedidos/pedidos.component';
import { PromocionesComponent } from 'src/app/submenu/tomadorPedidos/promociones/promociones.component';
import { VendedorComponent } from 'src/app/submenu/tomadorPedidos/vendedor/vendedor.component';
import { VerMasComponent } from 'src/app/submenu/tomadorPedidos/ver-mas/ver-mas.component';

import { TomadorPedidosComponent } from './tomadorPedidos.component';


const routes: Routes = [
  {
    path: '',
    component: TomadorPedidosComponent,
    children:[
      {
        path: '',
        redirectTo: 'articulos',
        pathMatch: 'full'
      },
      {
        path:'articulos',
        component:ArticulosComponent,
      },
      {
        path:'articulos/:cod',
        component:ArticuloComponent,
      },
      {
        path:'promociones',
        component:PromocionesComponent,
      },
      {
        path:'listaPrecios',
        component:ListaPreciosComponent,
      },
      {
        path:'pedidos',
        component:PedidosComponent
      }, 
      {
        path:'pedidos/:cod/:motivo',
        component:PedidoComponent
      },
      {
        path:'clientes',
        component:ClientesComponent,
      },
      {
        path:'clientes/:ccod_cliente',
        component:ClienteComponent
      },
      {
        path:'carrito',
        component:CarritoComponent,
      },
      {
        path:'vendedor',
        component:VendedorComponent
      },
      {
        path:'agenciasTransportes',
        component: AgenciasTransportesComponent
      },
      {
        path:'agenciasTransportes/:evento/:ccod_agencia',
        component: AgenciaFormComponent
      },
      {
        path:'verMas/:random',
        component:VerMasComponent
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
export class TomadorPedidosRoutingModule {}
