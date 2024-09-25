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
        this.isRuta = false;
        this.isAgenciaTransporte = true;
        break;
      case 'guiaRemision':
        this.nombreTitulo = 'Guia Remision';
        this.isVendedor = true;
        this.isPedidos = false;
        this.isGuias = true;
        this.isRuta = false;
        this.isAgenciaTransporte = true;
        break;
      case 'requerimiento':
        this.nombreTitulo = 'Requerimiento';
        this.isGuias = false;
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
