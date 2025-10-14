import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/service/login.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {

  private subscricion: Subscription = null

  constructor(
    private router: Router,
    private loginService: LoginService,
  ) { 
  }


  ngOnInit() {
    console.log('ngOnInit FacturacionComponent: ', this.loginService.getModulo())
 
  }


  ngOnDestroy(): void {
    console.log('Facuración destruido', this.subscricion);
    if (this.subscricion != null) {
      if (!this.subscricion.closed) {
        this.subscricion.unsubscribe()
      }
    }
  }
}
