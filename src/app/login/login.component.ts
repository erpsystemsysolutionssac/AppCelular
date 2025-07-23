import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { LoginGuard } from '../guard/login.guard';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { AppComponent } from '../app.component';
import { ToolsService } from '../service/tools.service';
import { GlobalService } from '../service/global.service';
import { NotificationsPushService } from '../service/notifications-push.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  @ViewChild('rucInicio', { read: ElementRef }) rucInicio: ElementRef;

  public borderTable = 'border border-light'
  public rucInicioValido = false;
  public datosRuc: any = {}
  public listaEmpresa: any[]
  public listaPtoVenta: any[]
  public listaUndNegocio: any[]
  public listaCtroCostos: any[]
  public empresaDefault: string
  public submited = false;
  loginForm: FormGroup;


  cencosAlertOptions = {
    header: 'Centro de Costo',
    // subHeader: 'Select your favorite topping',
    // message: 'Choose only one',
    translucent: true,
  };

  constructor(
    private loadingCtrl: LoadingController,
    public toastController: ToastController,
    private fb: FormBuilder,
    private loginService: LoginService,
    private toolS: ToolsService,
    private main: AppComponent,
    private router: Router,
    private globalService: GlobalService,
    private notificationsPushService: NotificationsPushService
  ) {
    localStorage.setItem('rucEmpresa', '');
  }

  ngOnInit() {
    // this.loginService.prueba2
    this.loginForm = this.fb.group({
      codigo_empresa: '',
      usuario: ['', Validators.required],
      password: ['', Validators.required],
      ptoVenta: '',
      undNegocio: '',
      ctrCostos: '',
    });

  }


  get usuario() {
    return this.loginForm.get('usuario');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async verificarRuc() {
    let rucInicio: string = this.rucInicio.nativeElement.value
    localStorage.setItem('rucEmpresa', rucInicio);

    await this.mostrarCargando()
    this.loginService.verificarRuc(rucInicio).
      then(async (data) => {
        this.datosRuc = data
        if (!data.estado) {
          await this.ocultarCargando()
          this.mostrarAlerta(data.mensaje)
          return
        }
        await this.listaEmpresas().then(() => { })
        await this.ocultarCargando()
        this.rucInicioValido = true
      }).catch((err) => {
        console.log(err);
        this.mostrarAlerta(err.message)
      })

  }

  async logear(form: FormGroup) {
    this.submited = true
    if (form.invalid) return

    let idLoading = await this.toolS.mostrarCargando('Ingresando')

    await Promise.all([
      this.loginService.loginERP(form.value),
      this.loginService.obtenerPermisos(form.value.codigo_empresa, form.value.usuario),
      this.loginService.logear(form.value),
      
    ])
      .then(async (resp) => {
        console.log(resp);
        if (!resp[0].estado) {
          await this.toolS.ocultarCargando(idLoading)
          this.mostrarAlerta(resp[0].message)
          return
        }
        if (!resp[2].estado) {
          await this.toolS.ocultarCargando(idLoading)
          this.mostrarAlerta(resp[2].msg)
          return
        }
        await this.toolS.ocultarCargando(idLoading)
        resp[2].ccod_almacen = this.listaPtoVenta.find((pto) => {
          return pto.ccod_almacen == form.value.ptoVenta
        }).erp_codalmacen_ptovta
        resp[2].punto_venta = form.value.ptoVenta
        resp[2].unidad_negocio = form.value.undNegocio
        resp[2].centro_costos = form.value.ctrCostos

        let dataUsuario = resp[2];

        this.notificationsPushService.init(dataUsuario);
        this.loginService.datosUsu = dataUsuario;
        this.loginService.datosUsu.permisos = resp[1]
        await this.loginService.obtenerVendedor()
        this.loginService.asingarVariables()

        this.loginService.guardarLogueo()
        this.main.cargarDatos()
     
        this.router.navigateByUrl('/menu')
  
      })
      .catch(async (err: any) => {
        console.log(err);
        this.toolS.mostrarAlerta(err.error, 'error', 6000)
        await this.toolS.ocultarCargando(idLoading)

      })

  }

  listaEmpresas() {
    return new Promise((resolve) => {

      this.loginService.listaEmpresas(this.datosRuc.pagina)
        .subscribe((resp) => {
 
          this.listaEmpresa = resp
          this.empresaDefault = resp[0].ccod_empresa
          this.loginForm.patchValue({
            codigo_empresa: this.empresaDefault
          })
          this.empresaSelect(this.empresaDefault)
          resolve(resp)
        })
    })

  }

  empresaSelect(empresa: any) {
    let codigo: any
    if (typeof empresa == 'string') {
      codigo = empresa
    } else {
      codigo = empresa.detail.value
    }
   
    this.mostrarCargando()

    Promise.all([this.selectPntVenta(codigo),
    this.selectUndNegocio(codigo),
    this.selectctrCostos(codigo)
    ]).then(() => {
      this.ocultarCargando()

    })

  }

  selectPntVenta(codigo: string) {
    return new Promise((resolve) => {
      this.loginService.listaPuntoVenta(codigo)
        .subscribe((resp) => {
          // resp[0].cnom_almacen='Punto de Venta'
          this.listaPtoVenta = resp
          if (resp[0].ccod_almacen == "001") {
            this.loginForm.patchValue({
              ptoVenta: resp[0].ccod_almacen
            })
          } else {
            this.loginForm.patchValue({
              ptoVenta: resp[1].ccod_almacen
            })
          }
          resolve(resp);

        })
    })

  }

  selectUndNegocio(codigo: string) {
    return new Promise((resolve) => {
      this.loginService.listaUnidadNegocio(codigo)
        .subscribe((resp) => {
          resp[0].erp_nomune = 'Unidad de Negocio'
          this.listaUndNegocio = resp
          this.loginForm.patchValue({
            undNegocio: resp[0].erp_codune
          })
          resolve(resp);
        })
    })

  }

  selectctrCostos(codigo: string) {
    return new Promise((resolve) => {
      this.loginService.listaCentroCosto(codigo)
        .subscribe((resp) => {
          resp[0].cnom_cencos = 'Centros de Costo'
          this.listaCtroCostos = resp
          this.loginForm.patchValue({
            ctrCostos: resp[0].ccod_cencos
          })
          resolve(resp);
        })
    })

  }


  async mostrarAlerta(msg: string) {
    const toast = await this.toastController.create({
      // header: 'Toast header',
      message: msg,
      icon: 'alert-outline',
      position: 'top',
      duration: 2000,
      color: 'primary'
      // buttons: [
      //   {
      //     side: 'start',
      //     icon: 'star',
      //     text: 'Favorite',
      //     handler: () => {
      //       console.log('Favorite clicked');
      //     }
      //   }, {
      //     text: 'Done',
      //     role: 'cancel',
      //     handler: () => {
      //       console.log('Cancel clicked');
      //     }
      //   }
      // ]
    });
    await toast.present();
  }

  async mostrarCargando() {
    let loading = await this.loadingCtrl.create({
      message: 'Buscando',
      duration: 3000
    });
    loading.present()
  }

  async ocultarCargando() {
    return this.loadingCtrl.dismiss()

  }

}
