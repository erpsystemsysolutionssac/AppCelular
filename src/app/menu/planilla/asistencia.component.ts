import { Component, Input, OnInit } from '@angular/core';
import { AsistenciaService } from 'src/app/service/planilla/asistencia.service';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.scss'],
})
export class AsistenciaComponent implements OnInit {

  modulo: string = 'asistencia';

  constructor(
    public asistenciaService: AsistenciaService
  ) { }

  ngOnInit() {

  }


}
