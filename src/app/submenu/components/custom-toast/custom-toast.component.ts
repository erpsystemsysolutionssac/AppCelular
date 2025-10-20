import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
})
export class CustomToastComponent implements OnInit {

  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' | 'info' = 'info';
  @Input() duracion = 4000;

  visible = true;

  get icono() {
    switch (this.tipo) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'information-circle';
    }
  }

  ngOnInit() {
    setTimeout(() => this.visible = false, this.duracion);
  }
}
