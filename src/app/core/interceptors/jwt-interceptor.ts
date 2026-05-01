import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

/**
 * Se registra en app.config.ts con provideHttpClient(withInterceptors([jwtInterceptor])).
 *
 * Hace dos cosas:
 * 1. Adjunta el token JWT a todas las peticiones dirigidas a nuestra API.
 * 2. Si el servidor responde 401 (token expirado/inválido), cierra la sesión automáticamente.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();

  // Solo adjuntamos el token si existe y la petición va a nuestra API
  let peticionModificada = req;

  if (token && authService.tokenValido()) {
    peticionModificada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  return next(peticionModificada).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor dice que no estamos autorizados, cerramos sesión
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
