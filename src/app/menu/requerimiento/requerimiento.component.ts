import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';

@Component({
  selector: 'app-requerimiento',
  templateUrl: './requerimiento.component.html',
  styleUrls: ['./requerimiento.component.scss'],
})
export class RequerimientoComponent implements OnInit {

  constructor(
    public requerimientoService: RequerimientoService,
     private router: Router,
  ) { }

  ngOnInit() {

  }

  random() {
    return new Date().getTime().toString()
  }

  irRuta() {
    this.router.navigate(['/tomadorPedidos/verMas/', this.random()])
  }
}
