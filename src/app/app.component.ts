import { Component, AfterViewInit } from '@angular/core';
import { LoginService } from './service/login.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {


  public paginas = [
    { title: 'Inicio', url: 'menu', icon: 'mail' },
    { title: 'Catalogo', url: 'catalogo', icon: 'paper-plane' },
    { title: 'Clientes', url: 'clientes', icon: 'heart' }

  ];

  public malo = false

  public usuario: any;

  constructor(
    public loginService: LoginService,
  ) {
    this.cargarDatos();
  }
  cargarDatos() {
    this.usuario = this.loginService.verificarLogueo()
  }
  cerrarSesion() {
    this.loginService.cerrarSesion()
  }
}
