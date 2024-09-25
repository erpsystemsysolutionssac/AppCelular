import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';
import { LoginService } from 'src/app/service/login.service';
import { AgenciaTransporteService } from 'src/app/service/tomadorPedidos/agencia-transporte.service';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-agencia',
  templateUrl: './agencia.component.html',
  styleUrls: ['./agencia.component.scss'],
})
export class AgenciaComponent implements OnInit {

  public agenciaForm: FormGroup;

  public agenciaEditar: any[];
  public ccod_agencia: string;
  public btnDisabled: boolean = false;
  public title: string = '';
  public evento: string = '';

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private loginS: LoginService,
      private fb: FormBuilder,
      private globalS: GlobalService,
      private toolsService: ToolsService,
      private agenciaTransporteService: AgenciaTransporteService
  ) { }

  async ngOnInit() {
      this.agenciaForm = this.fb.group({
          codigo: ['', [Validators.required]],
          nombre: ['', [Validators.required]],
          ruc: [''],
          direccion: [''],
          telefono: [''],
          email: [''],
          web: [''],
          contacto: ['']
      });

      this.route.params.subscribe(async (param) => {
          this.agenciaEditar = []

          switch (param.evento) {
              case 'guardar':
                  this.title = 'Agregando Agencia de Transporte';
                  break;
              case 'editar':
                  this.title = 'Editando Agencia de Transporte';
                  break;
              case 'consultar':
                  this.title = 'Consultando Agencia de Transporte';
                  break;
              case 'eliminar':
                  this.title = 'Eliminando Agencia de Transporte';
                  break;
          }

          this.evento = param.evento;
          this.ccod_agencia = param.ccod_agencia

          if (this.ccod_agencia == 'nuevo') {
              this.btnDisabled = true;

          } else {
              let idLoading = await this.toolsService.mostrarCargando('Cargando')

              await this.agenciaTransporteService.consultarAgencia(this.ccod_agencia).then(async (resp) => {
                  if (resp.length > 0) {
                      this.agenciaEditar.push(...resp)

                      this.evento == 'consultar' ? this.btnDisabled = false : this.btnDisabled = true;
                      this.agenciaForm.patchValue({
                          codigo: this.agenciaEditar[0].Codigo,
                          nombre: this.agenciaEditar[0].Nombre,
                          ruc: this.agenciaEditar[0].Ruc,
                          direccion: this.agenciaEditar[0].Direccion,
                          telefono: this.agenciaEditar[0].Telefono,
                          email: this.agenciaEditar[0].Email,
                          web: this.agenciaEditar[0].Web,
                          contacto: this.agenciaEditar[0].Contacto
                      })
                      this.agenciaForm.controls.codigo.disable()
                  }
              })

              await this.toolsService.ocultarCargando(idLoading)

          }
      })
  }


  async agregarAgencia(form: FormGroup) {
      let arrPromises: Promise<any>[] = [];
      let mensaje: string = '';
      if (form.invalid) {
          form.markAllAsTouched()
          this.toolsService.mostrarAlerta('Complete los Datos', 'warning')
          return
      }

      let idLoading = await this.toolsService.mostrarCargando('Agregando')
      let dataAgencia = form.getRawValue();

      switch (this.evento) {
          case 'guardar':
              arrPromises.push(this.agenciaTransporteService.agregarAgencia(dataAgencia));
              mensaje = 'Agencia Agregada';
              break;
          case 'editar':
              arrPromises.push(this.agenciaTransporteService.editarAgencia(dataAgencia));
              mensaje = 'Agencia Modificada';
              break;
          case 'eliminar':
              arrPromises.push(this.agenciaTransporteService.eliminarAgencia(dataAgencia));
              mensaje = 'Agencia Eliminada';
              break;
      }

      await Promise.all(arrPromises).then(async (resp) => {

          if (resp[0].estado) {

              this.toolsService.mostrarAlerta(mensaje, 'success')
              this.agenciaForm.reset()
              this.btnDisabled = false
              this.agenciaForm.enable()
              this.router.navigate(['../../'], { relativeTo: this.route })
              this.agenciaTransporteService.refrescar()
          } else {

              this.toolsService.mostrarAlerta('Ocurrio un error: ' + resp[0].mensaje, 'error')
          }
          await this.toolsService.ocultarCargando(idLoading)
      }).catch(async (err) => {
          console.log(err);
          await this.toolsService.ocultarCargando(idLoading)

      })

  }

  cancelar() {
      this.agenciaForm.reset()
      this.btnDisabled = false
      this.agenciaForm.enable()
      this.router.navigate(['../../'], { relativeTo: this.route })
  }
}
