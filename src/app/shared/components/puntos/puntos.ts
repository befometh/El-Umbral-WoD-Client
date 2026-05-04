import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  OnChanges, input
} from '@angular/core';
import {CommonModule} from '@angular/common';


export type ModoPuntos =
  | 'atributo'    // 1-10 Definido por generación, toggle para reserva
  | 'habilidad'   // 1-10 Definido por generación, toggle para reserva
  | 'disciplina'  // 1-10 Definido por generación, Tiene su propia función proveniente del servidor
  | 'virtud'      // 1-5 base, toggle para reserva
  | 'trasfondo'   // 1-5 base, toggle para reserva
  | 'salud'       // tracker de daño, recibe tipo Letal y Agravado
  | 'voluntad'    // Se divide en dos temporal y permanente, cada uno con su dado
  | 'sangre';     // 1 - X definido por generación, sin toggle

export type EstadoToggle = | 'error' | 'espera' | "sel1" | "sel2";
export type TipoDanno = | 'sano' | 'contundente' | 'letal' | 'agravado';

export interface ToggleDatos {
  nombre: string;
  valor: number;
}

@Component({
  selector: 'app-puntos',
  imports: [CommonModule],
  templateUrl: './puntos.html',
  styleUrl: './puntos.css',
})
export class Puntos {
  //Comunes en todos los componentes:
  @Input() nombre = '';
  @Input() valor = 0; // Valor actual
  @Input() modificador = 0; //Si contiene algún modificador dado por el usuario o por una disciplina
  @Input() maximo = 5; // Tope que permite el servidor
  @Input() capacidad = 10; // Casillas totales visibles
  @Input() modo: ModoPuntos = 'atributo';
  @Input() especializacion: string | null = '';
  @Input() editable = false; //Permite/inhibe que el jugador modifique esta característica
  @Input() toggleable = false; //Indica si el nombre actúa como un toggle o no
  @Input() estadoToggle = 'espera';

  //Exclusivos: Voluntad
  @Input() voluntadTemporal = 0;
  @Input() voluntadPermanente = 0; //Valor tope de la voluntadTemporal

  //Exclusivos: Salud
  @Input() dannoContundente = 0;
  @Input() dannoLetal = 0;
  @Input() dannoAgravado = 0;

  //Outputs:
  @Output() toggleClic = new EventEmitter<ToggleDatos>();
  @Output() valorCambio = new EventEmitter<number>();
  @Output() tirarPermanente = new EventEmitter<number>();
  @Output() tirarTemporal = new EventEmitter<number>();

  //Permite ver en las tarjetas puntos, si es mayor a 10, se refleja en barras porcentuales
  get modoNumerico(): boolean {
    return this.capacidad > 10;
  }

  //Convierte en porcentaje la el valor vs la capacidad de un elemento
  get porcentajeElemento(): number {
    return Math.round((this.valor / this.capacidad) * 100);
  }

  get filasSangre(): number [][] {
    const total = this.capacidad;
    //Creamos un array de dos dimensiones cuyo contenido va a tener el valor de la posición actual que va desde 1 hasta el total, cada fila albergará un tamaño total de 10 como máximo
    //de ahí que el Math.min() diferencie entre 10 o el "total-i" donde "i" es el incremento por cada fila disponible
    const filas: number[][] = [];
    for (let i = 0; i < total; i += 10)
      filas.push(
        Array.from({length: Math.min(10, total - i)}, (_, j) => i + j + 1)
      )
    return filas;
  }

  get casillasVoluntadPerm(): boolean[] {
    return Array.from({length: this.voluntadPermanente}, (_, i) => true);
  }

  get casillaVoluntadTemp(): boolean[] {
    return Array.from({length: this.voluntadPermanente}, (_, i) => i < this.voluntadTemporal)
  }

  //Para el sistema de la plantilla
  esCasillaPuntos(indice: number): boolean {
    return indice < this.valor;
  }

  esCasillaActiva(indice: number): boolean {
    return indice < this.maximo;
  }

  /**
   * La estructura de esta función se conforma de la siguiente forma
   * - Más a la derecha están los agravados, el daño más serio y dificil de curar, normalmente causaado por quemaduras por el fuego,
   *   el sol o ataques sobrenaturales con esta capacidad
   * - Luego los letales, daños cortantes y heridas abiertas, segundo en la jerarquía
   * - por último los contundentes.
   *
   * (A nivel de juego esto tiene importancia porque la curación debe ser en sentido inverso, no puedes curar un letal sin curar un
   * contundente por ejemplo)
   */
  construirCasillasSalud(): TipoDanno[] {
    const casillas: TipoDanno[] = Array(this.capacidad).fill('sano');
    let max = 0;
    for (let i = 0; i < this.dannoAgravado; i++)
      casillas[this.capacidad - 1 - i] = 'agravado';

    max += this.dannoAgravado;
    for (let i = 0; i < this.dannoLetal && (i + max) < this.capacidad; i++)
      casillas[this.capacidad - 1 - max - i] = 'letal';

    max += this.dannoLetal;
    for (let i = 0; i < this.dannoContundente && (i + max) < this.capacidad; i++)
      casillas[this.capacidad - 1 - max - i] = 'contundente';
    return casillas;
  }

  onNombreClick(): void {
    if (!this.toggleable) return;
    this.toggleClic.emit({nombre: this.nombre, valor: this.valor})
  }

  onCasillaClick(indice: number): void {
    if (!this.editable) return;
    if (this.modo === 'salud') return; //Salud tiene su propia lógica

    //Si hace clic en la casilla ya activa, resta en 1
    //Si hace clic en una casilla vacía que está bastante más por encima del valor, sube hasta ese valor

    const nuevoValor: number = indice < this.valor ? indice : indice + 1;
    const valorProcesado: number = Math.min(nuevoValor, this.maximo);
    this.valorCambio.emit(valorProcesado);
  }

  onDadoVolPermanente(){
    this.tirarPermanente.emit(this.voluntadPermanente);
  }

  onDadoVolTemporal(){
    if(this.voluntadTemporal <= 0) return;
    this.tirarTemporal.emit(this.voluntadTemporal);
  }

  get claseNombre():string{
    if (!this.toggleable) return 'nombre-label';
    return `nombre-label toggleable estado-${this.estadoToggle}`
  }

  get claseCasilla(): string{
    return `casilla-${this.modo}`;
  }

  ngOnChanges():void {
    //Aseguramos que el valor nunca supera al máximo
    if(this.valor > this.maximo){
      this.valorCambio.emit(this.maximo);
    }
  }
}
