import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  public titulo:String;
  public activo :boolean;

  constructor(private activatedRoute: ActivatedRoute,
    public loginService:LoginService,
    private router:Router,
    private tools:ToolsService,
    public globalService: GlobalService
    ) {
   }

  ngOnInit() {
    let dataLogin = JSON.parse(localStorage.getItem('login'));

    if(dataLogin){
      if (this.globalService.getDateOfNewDate() != dataLogin.fecha_trabajo_sistema) {
        this.cerrarSesion('Fecha de trabajo incorrecto, Cerrar Sesion');
      }
    }
  }

  cerrarSesion(mensaje?: string){
    this.tools.confirmarAlerta( mensaje || 'Cerrar Sesion','warning')
    .then(async (resp)=>{
      if (resp) {
        
        let idLoading = await this.tools.mostrarCargando('Cerrando Sesion')
        this.loginService.cerrarSesion()
        this.router.navigateByUrl('/login')  
        await this.tools.ocultarCargando(idLoading)

      }
    })

  
  }

}
