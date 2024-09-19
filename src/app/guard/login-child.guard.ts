import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginChildGuard implements CanActivateChild {
  constructor(private router:Router){

  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean  {
    
      // let logeo = this.loginService()

      // if (logeo.activo) {
      //   // this.router.navigateByUrl('menu')
      //   return true
      // }
      // else{
      //   this.router.navigateByUrl('login')
      //   return false;
      // }
  
      return false;
  }
  
}
