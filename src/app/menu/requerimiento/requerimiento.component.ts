import { Component, Input, OnInit } from '@angular/core';
import { RequerimientoService } from 'src/app/service/requerimiento/requerimiento.service';

@Component({
  selector: 'app-requerimiento',
  templateUrl: './requerimiento.component.html',
  styleUrls: ['./requerimiento.component.scss'],
})
export class RequerimientoComponent implements OnInit {

  modulo: string = 'requerimiento';

  constructor(
    public requerimientoService: RequerimientoService
  ) { }

  ngOnInit() {

  }


}
