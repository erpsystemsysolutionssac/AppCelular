import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizar'
})
export class CapitalizarPipe implements PipeTransform {

  transform(value: string|null ): string {

    if (value == undefined ||value == null) {
      return value
    }
    else if (value == value.toUpperCase()){
      return value.toLocaleLowerCase().split(' ')[0][0].toUpperCase()+value.slice(1).toLowerCase();
    }

  }

}
