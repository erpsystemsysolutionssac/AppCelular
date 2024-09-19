import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vendedor } from 'src/app/interfaces/interfases';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-vendedor',
  templateUrl: './vendedor.component.html',
  styleUrls: ['./vendedor.component.scss'],
})
export class VendedorComponent implements OnInit {

  public objVendedor:Vendedor

  public vendedorForm:FormGroup

  constructor(
    private loginS:LoginService,
    private fb:FormBuilder,
    private globalS:GlobalService,
    private toolsS:ToolsService
    ) { }

  ngOnInit() {    
    this.objVendedor = this.loginS.objVendedor
    this.vendedorForm = this.fb.group({
      nombre : [this.objVendedor.cnom_vendedor,[Validators.required]],
      correo:[this.objVendedor.email,[Validators.required]],
      celular: [this.objVendedor.celular],
      telefono:[this.objVendedor.telefono1]
    })
  }

  async editarVendedor(){
    let datosVend = this.vendedorForm.value 
    
    if (this.vendedorForm.invalid) {
      this.vendedorForm.markAllAsTouched()
      return
    }

    let estado = false

    await this.toolsS.confirmarAlerta('Se editara el vendedor','warning').then((confi)=>{
      estado =confi
    })

    if (!estado) return

    let idLoading = await this.toolsS.mostrarCargando('Editando')
    this.globalS.editarVendedor(datosVend).then(async(resp:any)=>{
      
      if(!resp.affectedRows ){
        await this.toolsS.ocultarCargando(idLoading)
        this.toolsS.mostrarAlerta('Ocurrio un error','error')

      }else{
        await this.toolsS.ocultarCargando(idLoading)
        this.toolsS.mostrarAlerta('Vendedor editado','success')

      }

      
    })

  }


}
