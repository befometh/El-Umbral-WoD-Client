import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { RolUsuario } from './core/services/auth';

export const routes: Routes = [

  // ── Pública ───────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login),
  },

  // ── Zona del Jugador (Vástago y superiores) ───────────────────────────────
  {
    path: 'personaje',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/personaje/ficha/ficha').then(m => m.Ficha),
      },
      {
        path: 'nuevo',
        canActivate: [rolGuard([RolUsuario.Antediluviano, RolUsuario.Matusalen])],
        loadComponent: () =>
          import('./features/personaje/creacion/creacion').then(m => m.Creacion),
      },
    ]
  },

  // ── Grimorio (todos los roles autenticados) ────────────────────────────────
  {
    path: 'grimorio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/grimorio/consulta/consulta').then(m => m.Consulta),
  },

  // ── Panel del Narrador (solo Antediluviano y Matusalén) ───────────────────
  {
    path: 'narrador',
    canActivate: [authGuard, rolGuard([RolUsuario.Antediluviano, RolUsuario.Matusalen])],
    loadComponent: () =>
      import('./features/narrador/dashboard/dashboard').then(m => m.Dashboard),
  },

  // ── Redirecciones ─────────────────────────────────────────────────────────
  { path: '',      redirectTo: 'login', pathMatch: 'full' },
  { path: '**',    redirectTo: 'login' },
];
