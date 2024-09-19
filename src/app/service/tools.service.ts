import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { environment, rucSystemsMype, rucSystemsSoft } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private loading: any;

  private arrLodaders: HTMLIonLoadingElement[] = [];

  public cargandoActivo: boolean = false;

  constructor(
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController  ) {}

  async mostrarAlerta(msg: string, icono = 'error', duracion: number = 2000) {
    let icon = '';
    switch (icono) {
      case 'error':
        icon = 'alert-outline';
        break;
      case 'success':
        icon = 'checkmark-circle-outline';
        break;
    }

    const toast = await this.toastController.create({
      // header: 'Toast header',
      message: msg,
      icon,
      position: 'top',
      duration: duracion,
      color: 'primary',
      // buttons: [
      //   {
      //     side: 'start',
      //     icon: 'star',
      //     text: 'Favorite',
      //     handler: () => {
      //       console.log('Favorite clicked');
      //     }
      //   }, {
      //     text: 'Done',
      //     role: 'cancel',
      //     handler: () => {
      //       console.log('Cancel clicked');
      //     }
      //   }
      // ]
    });
    await toast.present();
  }

  async confirmarAlerta(msg: string, icono: string = 'error') {
    let estado: boolean = false;
    let icon = '';
    switch (icono) {
      case 'error':
        icon = 'close-outline';
        break;
      case 'success':
        icon = 'checkmark-circle-outline';
        break;
      case 'warning':
        icon = 'alert-outline';
        break;
    }

    const alert = await this.alertController.create({
      header: msg,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            estado = false;
          },
        },
        {
          text: 'Aceptar',
          role: 'confirm',
          handler: () => {
            estado = true;
          },
        },
      ],
    });

    await alert.present();
    await alert.onDidDismiss();
    return estado;
  }

  async mostrarCargando(msg = 'Buscando') {
    let id: string;
    let loader: HTMLIonLoadingElement;
    await this.loadingCtrl
      .create({
        message: msg,
      })
      .then(async (resp) => {
        await resp.present();
        resp.id = new Date().getTime().toString();
        id = resp.id;
        loader = resp;
      });
    this.arrLodaders.push(loader);
    return id;
  }

  async ocultarCargando(id: string) {
    let loader: HTMLIonLoadingElement;
    let indLoader: number;
    loader = this.arrLodaders.find((load, ind) => {
      indLoader = ind;
      return load.id == id;
    });
    await loader.dismiss();
    this.arrLodaders.splice(indLoader, 1);
  }

  fechaHoy = function (fecha = new Date()) {
    return (
      fecha.getFullYear() +
      '-' +
      (fecha.getMonth() + 1 < 10 ? '0' : '') +
      (fecha.getMonth() + 1) +
      '-' +
      (fecha.getDate() < 10 ? '0' : '') +
      fecha.getDate()
    );
  };

  horaActual = function (fecha = new Date()) {
    return (
      (fecha.getHours() < 10 ? '0' : '') +
      fecha.getHours() +
      ':' +
      (fecha.getMinutes() < 10 ? '0' : '') +
      fecha.getMinutes() +
      ':' +
      (fecha.getSeconds() < 10 ? '0' : '') +
      fecha.getSeconds()
    );
  };

  fechaYHora = (fecha = new Date()) => {
    return this.fechaHoy(fecha) + ' ' + this.horaActual(fecha);
  };

  fechaYHoraIso(fecha = new Date()) {
    return this.fechaHoy() + 'T' + this.horaActual();
  }

  parsearMysqlDate(fecha: string | Date) {
    let f1: string | number = String(fecha);
    f1 = Date.parse(f1);
    return this.fechaYHora(new Date(f1));
  }

  parsearIso(fecha: string,hora:boolean=true) {
    let fecha1 = fecha.split('T');
    let fecha2 = fecha1[1].split('-');
    if (fecha2.length > 1) {
      fecha2.splice(1, 1);
    }
    if (!hora) {
      let hora0:string[] = fecha2[0].split(':')
      for (let index = 0; index < hora0.length; index++) hora0[index] ='00'
      fecha2[0]=hora0.join(':')
    }
    let fecha3 = fecha1[0] + ' ' + fecha2[0];
    return fecha3;
  }

  parsearFechaIso(fecha: string) {
    let fecha1 = fecha.split('T');
    let fecha3 = fecha1[0]
    return fecha3;
  }

  redondear(num: number, digits = 2) {
    if (digits === undefined) {
      digits = 0;
    }
    num = num * 1;
    var multiplicator = Math.pow(10, digits);
    num = parseFloat((num * multiplicator).toFixed(11));
    return Math.round(num) / multiplicator;
  }

  obtenerUrl(type: string){
    let datos = localStorage.getItem('rucEmpresa');
   
    let isruc = rucSystemsMype.includes(datos);
    let isrucSoft = rucSystemsSoft.includes(datos);
    
    if (isruc) {
      switch (type) {
        case 'url':
          return environment.erpSystemsMype.url; 
        case 'urlApi':
          return environment.erpSystemsMype.urlApi;
        case 'urlImagenes':
          return environment.erpSystemsMype.urlImagenes;
      }
      
    } else if (isrucSoft) {
      switch (type) {
        case 'url':
          return environment.erpSystemsSoft.url; 
        case 'urlApi':
          return environment.erpSystemsSoft.urlApi;
        case 'urlImagenes':
          return environment.erpSystemsSoft.urlImagenes;
      }
      
    } else {
      switch (type) {
        case 'url':
          return environment.erpSolutions.url; 
        case 'urlApi':
          return environment.erpSolutions.urlApi;
        case 'urlImagenes':
          return environment.erpSolutions.urlImagenes;
      }
    }
  }
}
