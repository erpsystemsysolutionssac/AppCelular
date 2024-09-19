import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router:Router,private loginService:LoginService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean  {

    let logeo = this.loginService.verificarLogueo()

    if (logeo.activo) {
      // this.router.navigateByUrl('menu')
      return true
    }
    else{
      this.router.navigateByUrl('login')
      return false;
    }

   
  }
  
}
