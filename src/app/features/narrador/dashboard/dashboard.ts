import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PersonajeResumen {
  id: number;
  nombre: string;
  clan: string;
  generacion: number;
  sire: string;
  jugadorId: number;
  jugadorNombre: string;
  presencia: 'online' | 'away' | 'offline';

  // Recursos
  saludActual: number;
  saludMax: number;
  voluntadActual: number;
  voluntadMax: number;
  sangreActual: number;
  sangreMax: number;

  // Estados
  estados: EstadoEspecial[];
  penalizaciones: number; // dados que se restan al pool
}

export type EstadoEspecial =
  | 'frenesí'
  | 'rotschreck'
  | 'torpor'
  | 'incapacitado'
  | 'hambre'
  | 'frenesi-latente';

export type SeccionSidebar =
  | 'coterie'
  | 'grimorio'
  | 'fichas'
  | 'historial'
  | 'notas';

export interface EscenaActiva {
  nombre: string;
  descripcion: string;
  turno: number;
}

// ─── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private router      = inject(Router);

  // ── Estado del usuario ────────────────────────────────────────────────────
  usuario    = this.authService.usuarioActual;
  esNarrador  = this.authService.esNarrador;

  // ── Sección activa del sidebar ────────────────────────────────────────────
  seccionActiva = signal<SeccionSidebar>('coterie');

  // ── Desplegables (solo uno puede estar abierto a la vez) ───────────────────────
  desplegableAbierto = signal<'iniciativa' | 'dificultad' | null>(null);

  abrirDesplegable(desplegable: 'iniciativa' | 'dificultad'): void {
    this.desplegableAbierto.update(actual =>
      actual === desplegable ? null : desplegable
    );
  }

  cerrarDesplegable(): void {
    this.desplegableAbierto.set(null);
  }

  iniciativaAbierta = computed(() => this.desplegableAbierto() === 'iniciativa');
  dificultadAbierta = computed(() => this.desplegableAbierto() === 'dificultad');

  // ── Panel narrador (solo en desktop) ─────────────────────────────────────
  panelNarradorVisible = signal(true);

  togglePanelNarrador(): void {
    this.panelNarradorVisible.update(v => !v);
  }

  // ── Dificultad ────────────────────────────────────────────────────────────
  dificultad          = signal(6);
  dificultadVisible   = signal(false); // false = solo narrador la ve

  readonly ETIQUETAS_DIFICULTAD: Record<number, string> = {
    1: 'Trivial', 2: 'Muy fácil', 3: 'Fácil',
    4: 'Con los ojos vendados', 5: 'Quizá falle...', 6: 'Normal',
    7: 'Difícil', 8: 'Extremo', 9: 'Bestial', 10: 'Todo o nada',
  };

  etiquetaDificultad = computed(() =>
    this.ETIQUETAS_DIFICULTAD[this.dificultad()] ?? ''
  );

  setDificultad(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value);
    this.dificultad.set(val);
    // TODO: emitir por WebSocket si dificultadVisible() === true
  }

  toggleDificultadVisible(): void {
    this.dificultadVisible.update(v => !v);
    // TODO: emitir evento por WebSocket
  }

  // ── Escena activa ─────────────────────────────────────────────────────────
  escenaActiva = signal<EscenaActiva>({
    nombre: 'La Reunión del Elíseo',
    descripcion: 'Los Vástagos se congregan bajo la tregua de la Mascarada.',
    turno: 1,
  });

  // ── Personaje con sheet abierto ───────────────────────────────────────────
  personajeSeleccionado = signal<PersonajeResumen | null>(null);
  sheetVisible          = signal(false);

  abrirSheet(personaje: PersonajeResumen): void {
    this.personajeSeleccionado.set(personaje);
    // Pequeño delay para que la animación de entrada se vea
    requestAnimationFrame(() => this.sheetVisible.set(true));
  }

  cerrarSheet(): void {
    this.sheetVisible.set(false);
    setTimeout(() => this.personajeSeleccionado.set(null), 350);
  }

  // ── Sesión activa ─────────────────────────────────────────────────────────
  sesionNombre = signal('Noche del Sabbat');
  sesionActiva = signal(true);

  // ── Coterie (datos de muestra — en producción vienen del API) ─────────────
  coterie = signal<PersonajeResumen[]>([
    {
      id: 1, nombre: 'Karim Al-Rashid', clan: 'Brujah', generacion: 8,
      sire: 'Lucita', jugadorId: 2, jugadorNombre: 'Andrés', presencia: 'online',
      saludActual: 6, saludMax: 7,
      voluntadActual: 5, voluntadMax: 7,
      sangreActual: 6, sangreMax: 10,
      estados: [], penalizaciones: 0,
    },
    {
      id: 2, nombre: 'Elise Verne', clan: 'Malkavian', generacion: 9,
      sire: 'Desconocido', jugadorId: 3, jugadorNombre: 'Clara', presencia: 'online',
      saludActual: 3, saludMax: 7,
      voluntadActual: 1, voluntadMax: 7,
      sangreActual: 1, sangreMax: 10,
      estados: ['frenesí', 'hambre'], penalizaciones: 2,
    },
    {
      id: 3, nombre: 'Lord Ashford', clan: 'Ventrue', generacion: 7,
      sire: 'Lord Vance', jugadorId: 4, jugadorNombre: 'Mateo', presencia: 'away',
      saludActual: 5, saludMax: 7,
      voluntadActual: 6, voluntadMax: 7,
      sangreActual: 4, sangreMax: 12,
      estados: [], penalizaciones: 0,
    },
    {
      id: 4, nombre: 'Clovis', clan: 'Nosferatu', generacion: 10,
      sire: 'El Subterráneo', jugadorId: 5, jugadorNombre: 'Irene', presencia: 'offline',
      saludActual: 7, saludMax: 7,
      voluntadActual: 4, voluntadMax: 6,
      sangreActual: 5, sangreMax: 8,
      estados: [], penalizaciones: 0,
    },
  ]);

  // ── Helpers para templates ────────────────────────────────────────────────

  porcentaje(actual: number, max: number): number {
    return Math.round((actual / max) * 100);
  }

  tieneEstadoCritico(pj: PersonajeResumen): boolean {
    return pj.estados.includes('frenesí') ||
      pj.estados.includes('rotschreck') ||
      pj.estados.includes('incapacitado');
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // ── Sidebar items ─────────────────────────────────────────────────────────
  readonly SIDEBAR_ITEMS: { id: SeccionSidebar; icono: string; label: string }[] = [
    { id: 'coterie',  icono: '◈', label: 'Coterie'  },
    { id: 'grimorio', icono: '◉', label: 'Grimorio' },
    { id: 'fichas',   icono: '◌', label: 'Fichas'   },
    { id: 'historial',icono: '◎', label: 'Historial'},
    { id: 'notas',    icono: '✎', label: 'Notas'    },
  ];

  irA(seccion: SeccionSidebar): void {
    if (seccion === 'grimorio') {
      this.router.navigate(['/grimorio']);
      return;
    }
    this.seccionActiva.set(seccion);
  }

  // ── Notas de sesión ───────────────────────────────────────────────────────
  notasSesion = signal('');

  actualizarNotas(event: Event): void {
    this.notasSesion.set((event.target as HTMLTextAreaElement).value);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // TODO: suscribirse al canal WebSocket de la sesión
    // TODO: cargar coterie desde API
  }

  ngOnDestroy(): void {
    // TODO: desconectar WebSocket
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
  }
}
