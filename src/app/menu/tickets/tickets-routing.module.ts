import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AtencionTicketsComponent } from 'src/app/submenu/tickets/atencionTickets/atencion-tickets.component';
import { TicketsComponent } from './tickets.component';



const routes: Routes = [
  {
    path: '',
    component: TicketsComponent,
    children: [
      { path: '', redirectTo: 'lector_qr', pathMatch: 'full'},
      { path: 'lector_qr', component: AtencionTicketsComponent },
      { path: '**', redirectTo: 'lector_qr' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule { }
