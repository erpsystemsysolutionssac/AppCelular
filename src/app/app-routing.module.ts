import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guard/login.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component:LoginComponent
  },
  {
    path: 'menu',
    canActivate:[LoginGuard],
    loadChildren: () => import('./menu/inicio/inicio.module').then( m => m.InicioModule)
  },
  {
    path: 'guiaRemision',
    canActivate:[LoginGuard],
    loadChildren: () => import('./menu/guia-remision/guia-remision.module').then( m => m.GuiaRemisionModule)
  },
  {
    path: 'facturacion',
    canActivate:[LoginGuard],
    loadChildren: () => import('./menu/facturacion/facturacion.module').then( m => m.FacturacionModule)
  },
  {
    path: 'tomadorPedidos',
    canActivate:[LoginGuard],
    loadChildren: () => import('./menu/tomadorPedidos/tomadorPedidos.module').then( m => m.TomadorPedidosModule)
  },
  {
    path: 'despacho',
    canActivate: [LoginGuard],
    loadChildren: () => import('./menu/despacho/despacho.module').then(m => m.DespachoModule)
  },
  {
    path: 'requerimiento',
    canActivate: [LoginGuard],
    loadChildren: () => import('./menu/requerimiento/requerimiento.module').then(m => m.RequerimientoModule)
  },
  {
    path: 'asistencia',
    canActivate: [LoginGuard],
    loadChildren: () => import('./menu/planilla/asistencia.module').then(m => m.AsistenciaModule)
  },
  {
    path: '**',
    redirectTo: 'menu'
  }
 
];


  
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
