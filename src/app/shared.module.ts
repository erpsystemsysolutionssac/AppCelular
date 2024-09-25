import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CapitalizarPipe } from './pipes/capitalizar.pipe';
import { ImagenPipe } from './pipes/imagen.pipe';

@NgModule({
  declarations: [ImagenPipe, CapitalizarPipe],
  imports: [
    CommonModule
  ],
  exports: [ImagenPipe, CapitalizarPipe]
})
export class SharedModule {
  

 }
