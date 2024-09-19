import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabs } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';

@Component({
  selector: 'app-tomadorPedidos',
  templateUrl: './tomadorPedidos.component.html',
  styleUrls: ['./tomadorPedidos.component.scss'],
})
export class TomadorPedidosComponent implements OnInit, OnDestroy {

  modulo: string = 'tomadorPedidos';

  private subscricion: Subscription = null

  constructor(
    public carritoS: CarritoService,
    private router: Router,
    private route: ActivatedRoute,
    private artituloService: ArticuloService,
  ) {
    
  }

  public catalogoMenu = [
    { titulo: 'Articulos', url: 'articulos' },
    { titulo: 'Familias', url: '/catalogo' },
    { titulo: 'Sub Familais', url: '/catalogo' },
    { titulo: 'Concepto 1', url: '/catalogo' },
    { titulo: 'Concepto 2', url: '/catalogo' },
    { titulo: 'Concepto 3', url: '/catalogo' },
    { titulo: 'Concepto 4', url: '/catalogo' },
    { titulo: 'Concepto 5', url: '/catalogo' },
    { titulo: 'Concepto 6', url: '/catalogo' },
    { titulo: 'Concepto 7', url: '/catalogo' },
  ]


  ngOnInit() {
    console.log('ngOnInit Pedido')
    localStorage.setItem('modulo', this.modulo);
    console.log(this.carritoS.arrCarrito);
    let dataCarrito = localStorage.getItem('arrCarrito_'+this.modulo);
    let dataCliente = localStorage.getItem('objCliente_'+this.modulo);
  
    this.carritoS.arrCarrito = []

    if (JSON.parse(dataCarrito)) {
      this.carritoS.arrCarrito = JSON.parse(dataCarrito);
    }

    this.carritoS.objCliente = {};
    this.carritoS.arrFormasPago = []
    this.carritoS.arrDirecciones = []
    this.carritoS.arrAgencias = []

    if (JSON.parse(dataCliente)) {
      this.carritoS.objCliente = JSON.parse(dataCliente);
      this.carritoS.arrFormasPago = []
      this.carritoS.arrDirecciones = []
      this.carritoS.arrAgencias = []
      if (this.carritoS.objCliente.ccod_cliente) {
        this.carritoS.arrDirecciones.push(...this.carritoS.objCliente.direcciones)
        this.carritoS.arrAgencias.push(...this.carritoS.objCliente.agencias)
        this.carritoS.arrFormasPago.push(...this.carritoS.objCliente.forma_pagos)
      }
    }
  }

  random() {
    return new Date().getTime().toString()
  }

  irRuta() {
    this.router.navigate(['/tomadorPedidos/verMas/', this.random()])
  }

  eventoActualizarArticulos(){
    this.artituloService.eventSeleccionArticulo.next(true);
  }

  ngOnDestroy(): void {
    console.log('Tomador Pedido destruido', this.subscricion);
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }

}
