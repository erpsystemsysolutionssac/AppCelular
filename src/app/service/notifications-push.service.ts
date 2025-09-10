import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { GlobalService } from './global.service';
import { ToolsService } from './tools.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationsPushService {
  
  private rutaLogin = this.toolsService.obtenerUrl('url') + '/global'

  private dataUsuario: any;
  private enable: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient, 
    private toolsService: ToolsService,
    private globalService: GlobalService,
  ) { }

  init(dataUsuario: any) {
    console.log('Initializing push notifications for user:', dataUsuario);
    this.dataUsuario = dataUsuario || {};
    // this.saveToken('jkasdkljahsdkjasdjkkajshdgkjashgdjkashdgkjashgdkjashgdkjasghdkj')
    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          console.log('Push notifications permission granted');
          PushNotifications.register();
        } else {
          // Show some error
        }
      });
      this.addListener();
    }
  }

  private addListener(){
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        this.saveToken(token.value);
        this.enable = true;
        // alert('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.error('Push registration error: ' + JSON.stringify(error));
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        const dataNotificacion = notification;
        
        this.toolsService.alertaNotificaciones(
          dataNotificacion.title || 'Notificacion',
          dataNotificacion.body || 'No body',
          'success'
        );
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        const dataNotificacion = notification;
        const rutaAccion = dataNotificacion.notification.data.accion_ruta || '';
        switch (rutaAccion) {
          case 'listaRequermientoAprobacion':
            this.router.navigateByUrl('/requerimiento/aprobacion')
            break;
          case 'listaPedidoAprobacion':
            this.router.navigateByUrl('/tomadorPedidos/aprobacion')
            break
          default:
            break;
        }
      }
    );
  }

  async saveToken(token: string) {
    // Here you can save the token to your server or local storage
    const dataBody = {
      ccod_empresa: this.dataUsuario.codigo_empresa,
      ccod_usuario: this.dataUsuario.codigo_usuario,
      ccod_cencos: this.dataUsuario.centro_costos,
      ccod_unidad_negocio: this.dataUsuario.unidad_negocio,
      token
    }

    const resp  = await this.http.post(this.rutaLogin + '/guardar_tokens_dispositivo', dataBody ).toPromise()
    console.log(resp);
  }

}
