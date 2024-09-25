import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cliente } from 'src/app/interfaces/cliente';
import Swiper, { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-modal-imagenes-cliente',
  templateUrl: './modal-imagenes-cliente.component.html',
  styleUrls: ['./modal-imagenes-cliente.component.scss'],
})
export class ModalImagenesClienteComponent implements OnInit {

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true, },
    autoHeight: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    zoom: { maxRatio: 10 }
  };

  imagenCambiar: any
  public arrImagenes: any[] = []

  @Input() data: Cliente;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    const cliente = this.data;
    this.arrImagenes = []
    let ind = 1
    Object.entries(cliente).forEach(([key, val]) => {
      if (key.includes('imagen')) {
        this.arrImagenes.push({ nro: ind, src: val })
      }
    })
  }

  cerrarImagenesModal() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

  onSwiper(swiper: Swiper) {
    this.imagenCambiar = this.arrImagenes.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }

  onSlideChange([swiper]) {
    this.imagenCambiar = this.arrImagenes.find((img) => {
      return img.nro == swiper.activeIndex + 1
    })
  }
}
