import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/service/login.service';
import { ProductoService } from 'src/app/service/mantenimiento/producto.service';
import { ArticuloService } from 'src/app/service/tomadorPedidos/articulo.service';
import { CarritoService } from 'src/app/service/tomadorPedidos/carrito.service';

@Component({
  selector: 'app-guia-remision',
  templateUrl: './guia-remision.component.html',
  styleUrls: ['./guia-remision.component.scss'],
})
export class GuiaRemisionComponent implements OnInit, OnDestroy {

  private subscricion: Subscription = null

  constructor(
    private router: Router,
    private loginService: LoginService,
    public carritoService: CarritoService,
    private productoService: ProductoService,
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
    console.log('ngOnInit GuiaRemisionComponent: ', this.loginService.getModulo())
    let dataCarrito = localStorage.getItem('arrCarrito_'+this.loginService.getModulo());
    let dataCliente = localStorage.getItem('objCliente_'+this.loginService.getModulo());
  
    this.carritoService.arrayCarrito = []

    if (JSON.parse(dataCarrito)) {
      this.carritoService.arrayCarrito = JSON.parse(dataCarrito);
      this.carritoService.calcularDetalleVenta();
    }

    this.carritoService.objCliente = {};
    this.carritoService.arrFormasPago = []
    this.carritoService.arrDirecciones = []
    this.carritoService.arrAgencias = []

    if (JSON.parse(dataCliente)) {
      this.carritoService.objCliente = JSON.parse(dataCliente);
      this.carritoService.arrFormasPago = []
      this.carritoService.arrDirecciones = []
      this.carritoService.arrAgencias = []
      if (this.carritoService.objCliente.ccod_cliente) {
        this.carritoService.arrDirecciones.push(...this.carritoService.objCliente.direcciones)
        this.carritoService.arrAgencias.push(...this.carritoService.objCliente.agencias)
        this.carritoService.arrFormasPago.push(...this.carritoService.objCliente.forma_pagos)
      }
    }
  }

  random() {
    return new Date().getTime().toString()
  }

  irRuta() {
    this.router.navigate(['/guiaRemision/verMas/', this.random()])
  }

  eventoActualizarArticulos(){
    this.productoService.eventSeleccionArticulo.next(true);
  }

  ngOnDestroy(): void {
    console.log('Guia de Remision destruido', this.subscricion);
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }
}
