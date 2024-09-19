import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginService } from '../service/login.service';
import { ToolsService } from '../service/tools.service';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  private rutaImages = this.toolsService.obtenerUrl('urlImagenes');

  constructor(
    private loginService:LoginService,
    private toolsService: ToolsService
  ){}

  transform(value: any,campo:string = 'clientes'): string {
    let codigo_empresa =    this.loginService.codigo_empresa
    let rutaImagenes = `${this.rutaImages}/${codigo_empresa}/movil/${campo}/`

  
      if (value == '') {
        return './../../../assets/default.svg';
      }
      else if  (value == null) {
        return './../../../assets/default.svg';
      }
      else if (value.changingThisBreaksApplicationSecurity) {
        return value
      }
      else{
        return rutaImagenes +value
      }
    

    
  }

}
