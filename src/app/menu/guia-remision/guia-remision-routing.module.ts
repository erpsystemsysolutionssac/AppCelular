import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GuiaRemisionComponent } from './guia-remision.component';

import { ArticuloComponent } from 'src/app/submenu/guiaRemision/articulo/articulo.component';
import { ArticulosComponent } from 'src/app/submenu/guiaRemision/articulos/articulos.component';
import { PromocionesComponent } from 'src/app/submenu/guiaRemision/promociones/promociones.component';
import { ListaPreciosComponent } from 'src/app/submenu/guiaRemision/lista-precios/lista-precios.component';
import { ClientesComponent } from 'src/app/submenu/guiaRemision/clientes/clientes.component';
import { ClienteComponent } from 'src/app/submenu/guiaRemision/cliente/cliente.component';
import { CarritoComponent } from 'src/app/submenu/guiaRemision/carrito/carrito.component';
import { VendedorComponent } from 'src/app/submenu/guiaRemision/vendedor/vendedor.component';
import { AgenciasTransportesComponent } from 'src/app/submenu/guiaRemision/agencias-transportes/agencias-transportes.component';
import { AgenciaFormComponent } from 'src/app/submenu/guiaRemision/agencia-form/agencia-form.component';
import { VerMasComponent } from 'src/app/submenu/guiaRemision/ver-mas/ver-mas.component';
import { GuiasComponent } from 'src/app/submenu/guiaRemision/guias/guias.component';
import { GuiaComponent } from 'src/app/submenu/guiaRemision/guia/guia.component';

const routes: Routes = [
  {
    path: '',
    component: GuiaRemisionComponent,
    children: [
      { path: '', redirectTo: 'articulos', pathMatch: 'full'},
      { path: 'articulos', component: ArticulosComponent, },
      { path: 'articulos/:cod', component: ArticuloComponent, },
      { path: 'promociones', component: PromocionesComponent, },
      { path: 'listaPrecios', component: ListaPreciosComponent, },
      { path: 'guias', component: GuiasComponent },
      { path: 'guias/:motivo/:numeroDocumento', component: GuiaComponent },
      { path: 'clientes', component: ClientesComponent, },
      { path: 'clientes/:ccod_cliente', component: ClienteComponent },
      { path: 'carrito', component: CarritoComponent, },
      { path: 'vendedor', component: VendedorComponent },
      { path: 'agenciasTransportes', component: AgenciasTransportesComponent },
      { path: 'agenciasTransportes/:evento/:ccod_agencia', component: AgenciaFormComponent },
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
