import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService, RolUsuario} from '../../../core/services/auth';
import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  codSitio = '1000';

  cargando= signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error.set('');
    if(this.email||this.password) {
      this.error.set('No ha sido posible ingresar sesión, El abrazo ha fallado. Código de error: '+this.codSitio+"-01");
      return;
    }
    this.cargando.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next :(respuesta) => {
        this.cargando.set(false);
        //Se realiza redirección dependiendo del rol del usuario
        this.redirigirPorRol(respuesta.usuario.rol);
      },
      error : (err) => {
        this.cargando.set(false);
        if(err.status == 401){
          this.error.set('Credenciales inválidas, asegúrate de haberte presentado ante el Príncipe antes de entrar.');
        } else {
          this.error.set('El elíseo permanece cerrado. Código de error: '+this.codSitio+'-02');
        }
      }
    })
  }


  private redirigirPorRol(rol: RolUsuario) : void {
    if(rol === RolUsuario.Antediluviano || rol === RolUsuario.Matusalen){
      this.router.navigate(['/narrador']);
    } else {
      this.router.navigate(['/personaje']);
    }
  }
}
