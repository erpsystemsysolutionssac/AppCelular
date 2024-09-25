import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit {

  constructor(
    public loginService: LoginService,
    private router: Router,
  ) { }

  ngOnInit() {

  }

  irModulo(modulo: string){
    this.loginService.updateModulo(modulo)
    this.router.navigate(['/'+modulo]);
  }
}
