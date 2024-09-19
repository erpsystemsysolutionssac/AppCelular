import { NgModule } from '@angular/core';
import { CapitalizarPipe } from './pipes/capitalizar.pipe';
import { ImagenPipe } from './pipes/imagen.pipe';

@NgModule({
  imports: [
    
  ],
  declarations: [ImagenPipe,CapitalizarPipe],
  exports: [ImagenPipe,CapitalizarPipe]
})
export class SharedModule {
  

 }
