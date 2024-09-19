import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketWebService{

  // constructor(private socket: Socket) {
  //   this.sendMessage()
  //  }

  // constructor(
  //   private socket: Socket
  // ) { 
  //   super({
  //     url: 'http://192.168.1.111:5000',
  //     options: {
  //       query: {"codigo_empresa": '0000000001'}
  //     }
  //   })
  //   console.log('SocketWebService')
  //   // this.sendMessage();
  // }

  sendMessage() {
		// this.socket.emit('fetchMovies');
	} 

}
