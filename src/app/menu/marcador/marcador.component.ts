import { Component, Input, OnInit } from '@angular/core';
import { MarcadorService } from 'src/app/service/marcador/marcador.service';

@Component({
  selector: 'app-marcador',
  templateUrl: './marcador.component.html',
  styleUrls: ['./marcador.component.scss'],
})
export class MarcadorComponent implements OnInit {

  modulo: string = 'marcador';

  constructor(
    public marcadorService: MarcadorService
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter(){
    console.log("didenter")
  }
  ionViewWillEnter(){
      console.log("ionViewWillEnter ")
  }

}
