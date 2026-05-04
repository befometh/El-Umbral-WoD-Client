import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard de autenticación.
 * Bloquea cualquier ruta si no hay sesión activa.
 * Uso en rutas: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado() && authService.tokenValido()) {
    return true;
  }

  console.log(authService.tokenValido());
  // Sin sesión: redirigimos al login
  return router.createUrlTree(['/login']);
};



