import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  public _modulo: string = '';
  public nombreTitulo: string = '';
  public isVendedor: boolean = false;
  public isPedidos: boolean = false;
  public isGuias: boolean = false;
  public isFacturas: boolean = false;
  public isRuta: boolean = false;
  public isAgenciaTransporte: boolean = false;
  public isRequermientos: boolean = false;

  @Output() execIrRuta: EventEmitter<any> = new EventEmitter();

  constructor(
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this._modulo = this.loginService.getModulo();
    switch (this._modulo) {
      case 'tomadorPedidos':
        this.nombreTitulo = 'Tomador de Pedidos';
        this.isVendedor = true;
        this.isPedidos = true;
        this.isGuias = false;
        this.isFacturas = false;
        this.isRuta = false;
        this.isAgenciaTransporte = true;
        break;
      case 'guiaRemision':
        this.nombreTitulo = 'Guía Remisión';
        this.isVendedor = true;
        this.isPedidos = false;
        this.isGuias = true;
        this.isFacturas = false;
        this.isRuta = false;
        this.isAgenciaTransporte = true;
        break;
      case 'facturacion':
        this.nombreTitulo = 'Facturación';
        this.isVendedor = true;
        this.isPedidos = false;
        this.isGuias = false;
        this.isFacturas = true;
        this.isRuta = false;
        this.isAgenciaTransporte = false;
        break;
      case 'requerimiento':
        this.nombreTitulo = 'Requerimiento';
        this.isGuias = false;
        this.isFacturas = false;
        this.isRequermientos = true;
        this.isAgenciaTransporte = true;
        break;
      default:
        break;
    }
  }

  irRuta() {
    this.execIrRuta.emit();
  }

}
