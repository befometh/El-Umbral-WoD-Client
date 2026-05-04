import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, RolUsuario } from '../services/auth';

/**
 * Guard de rol.
 * Recibe los roles permitidos y comprueba si el usuario actual tiene alguno de ellos.
 *
 * Uso en rutas:
 *   canActivate: [rolGuard([RolUsuario.Antediluviano, RolUsuario.Matusalén])]
 */
export const rolGuard = (rolesPermitidos: RolUsuario[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const usuario = authService.usuarioActual();

    if (!usuario) {
      return router.createUrlTree(['/login']);
    }

    if (rolesPermitidos.includes(usuario.role)) {
      return true;
    }

    // Tiene sesión pero no el rol necesario: redirigimos a su ficha
    return router.createUrlTree(['/personaje']);
  };
};
