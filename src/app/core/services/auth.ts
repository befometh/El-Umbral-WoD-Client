import {Injectable, signal, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  name: string;
  email: string;
  role: RolUsuario;
}

// Roles temáticos mapeados a valores numéricos (igual que el backend)
export enum RolUsuario {
  Antediluviano = 1,  // Admin total
  Matusalen = 2,  // DJ auxiliar
  Vastago = 3,  // Jugador normal
  Ghoul = 4, //Observador
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: Usuario;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({providedIn: 'root'})
export class AuthService {

  private readonly TOKEN_KEY = 'umbral_token';
  private readonly USUARIO_KEY = 'umbral_usuario';
  private readonly API = environment.apiUrl;

  // Signals reactivos - cualquier componente puede suscribirse
  usuarioActual = signal<Usuario | null>(this.cargarUsuarioGuardado());
  estaAutenticado = computed(() => this.usuarioActual() !== null);

  // Computed de rol: facilita los guards y los *ngIf en templates
  esAntediluviano = computed(() => this.usuarioActual()?.role === RolUsuario.Antediluviano);
  esMatusalen = computed(() => this.usuarioActual()?.role === RolUsuario.Matusalen);
  esNarrador = computed(() =>
    this.usuarioActual()?.role === RolUsuario.Antediluviano ||
    this.usuarioActual()?.role === RolUsuario.Matusalen
  );
  esVastago = computed(()=>this.usuarioActual()?.role === RolUsuario.Vastago);
  esGhoul = computed(()=>this.usuarioActual()?.role === RolUsuario.Ghoul);


  constructor(private http: HttpClient, private router: Router) {
  }

  // Sección: Login

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, {email, password})
      .pipe(
        tap(respuesta => {
          if (respuesta.success) {
            this.guardarSesion(respuesta.token, respuesta.user);
          }
        })
      );
  }

  // Seccion: Logout (pendiente de implementacion)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  //  Token: Cuerpo del JWT

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica que el token recibido sea válido como token JWT para evitar filtración de datos
   */
  tokenValido(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    try {
      // Decodificamos el payload del JWT (sin librería externa)
      // Un JWT consiste en tres partes separadas por . un Header.Payload.Signature
      const payload = JSON.parse(atob(token.split('.')[1])); //Buscamos obtener la segunda parte, (payload), atob, (ASCII to Binary) permite esa conversión, por último se parsea ya que viene en formato JSON
      const ahora = Math.floor(Date.now() / 1000);
      return payload.exp > ahora; //Si el token de expiración es mayor que el actual, el token sigue siendo válido
    } catch {
      return false;
    }
  }

  // ── Helpers privados ───────────────────────────────────────────────────────
  /**
   * Permite guardar un registro de la sección activa en ese momento
   * @param token     string    Correspondiente a la sección media de tres partes del JWT: Payload
   * @param usuario   Usuario   Json con los datos del usuario logueado en el momento
   * @private
   */
  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
  }

  private cargarUsuarioGuardado(): Usuario | null {
    const datos = localStorage.getItem(this.USUARIO_KEY);
    if (!datos) {
      return null;
    }

    try {
      return JSON.parse(datos) as Usuario;
    } catch {
      return null;
    }
  }
}
