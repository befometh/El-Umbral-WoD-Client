import {
  AfterViewInit,
  Component,
  QueryList,
  ViewChildren,
  signal,
  computed
} from '@angular/core';
import {Puntos, ModoPuntos, ToggleDatos} from '../../../shared/components/puntos/puntos';

export interface PersonajeFicha {
  id: number;
  nombre: string;
  foto?: string;
  clan: string;
  naturaleza: string;
  conducta: string;
  sire: string;
  jugadorNombre: string;
  generacion: number;

  // Voluntad
  voluntadPermanente: number;
  voluntadTemporal: number;

  // Sangre
  sangreActual: number;
  sangreMax: number;

  // Salud
  saludMax: number;
  dannoContundente: number;
  dannoLetal: number;
  dannoAgravado: number;
}

@Component({
  selector: 'app-ficha',
  imports: [
    Puntos
  ],
  templateUrl: './ficha.html',
  styleUrl: './ficha.css',
})
export class Ficha implements AfterViewInit {
  //--------Sección 1: Datos Básicos del Personaje
  //Sección Declaradores/Conectores
  personaje = signal<PersonajeFicha | null>({
    id: 1,
    nombre: 'Pandora',
    clan: 'Malkavian',
    naturaleza: 'Visionaria',
    conducta: 'Conformista',
    sire: 'Cordelia',
    jugadorNombre: 'Carolina',
    generacion: 13,
    voluntadPermanente: 7,
    voluntadTemporal: 5,
    sangreActual: 8,
    sangreMax: 10,       //Depende del valor que entregue el servidor
    saludMax: 7,
    dannoContundente: 0,
    dannoLetal: 1,
    dannoAgravado: 0,
  });
 //Lugar separado para foto
  iniciales = computed(() => {
    const nombre = this.personaje()?.nombre ?? '';
    return nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  });

  // Toggle del desplegable de info adicional
  infoAdicionalVisible = signal(false);

  toggleInfoAdicional(): void {
    this.infoAdicionalVisible.update(v => !v);
  }

  // Tirada de voluntad
  onTirarVoluntad(dados: number): void {
    console.log(`Tirando Voluntad: ${dados} dados`);
    // TODO: conectar con el panel de reserva de dados
  }


  //--------Sección 2: Cuerpo de la Hoja
  private dados: [string, number][] = [];
  private dado1Sel = true;
  protected edicion = true;

  protected atributos: { tipo: string, lista: string[] }[] = [{
    tipo: 'fisicos',
    lista: ['fuerza', 'destreza', 'resistencia']
  }, {
    tipo: 'sociales',
    lista: ['carisma', 'manipulacion', 'apariencia']
  }, {
    tipo: 'mentales',
    lista: ['percepcion', 'inteligencia', 'astucia']
  }
  ]
  protected habilidades: { tipo: string, lista: string[] }[] = [{
    tipo: 'talentos',
    lista: ['alerta', 'atletismo', 'callejeo', 'consciencia', 'empatia', 'expresion', 'intimidacion', 'liderazgo', 'pelea', 'subterfugio']
  }, {
    tipo: 'tecnicas',
    lista: ['armas de fuego', 'artesania', 'conducir', 'etiqueta', 'interpretacion', 'latrocinio', 'pelea con armas', 'sigilo', 'supervivencia', 'trato con animales']
  }, {
    tipo: 'conocimientos',
    lista: ['academicismo', 'ciencias', 'finanzas', 'informatica', 'investigacion', 'leyes', 'medicina', 'ocultismo', 'politica', 'tecnologia']
  }]
  protected complementos: { tipo: string, modo: ModoPuntos, lista: string[] }[] = [
    {tipo: 'disciplinas', modo: "disciplina", lista: []},
    {tipo: 'trasfondos', modo: 'trasfondo', lista: []},
    {
      tipo: 'virtudes', modo: 'virtud', lista: ['autocontrol', 'instinto', 'coraje']
    }];
  @ViewChildren(Puntos) campos!: QueryList<Puntos>;


  getEstadoToggle(elem: string) {
    let campo = this.campos?.find(campo => campo.nombre === elem); //Verificamos que campos exista
    return campo?.estadoToggle ?? 'espera';
  }

  onToggle($event: ToggleDatos) {
    let campo = this.campos!.find(campo => campo.nombre === $event.nombre)!;
    switch (campo.estadoToggle) {
      case 'sel1':
        if (this.dados[0])
          this.dados.splice(0, 1);
        campo.estadoToggle = 'espera';
        this.dado1Sel = true;
        break;
      case 'sel2':
        if (this.dados[1])
          this.dados.splice(1, 1);
        campo.estadoToggle = 'espera';
        this.dado1Sel = false;
        break;
      default:
        let pos = this.dado1Sel ? 0 : 1;
        let temp = this.dados[pos]?.[0];
        if (temp) {
          let campo2 = this.campos!.find(campo => campo.nombre === temp)!;
          campo2.estadoToggle = 'espera';
        }
        this.dados[pos] = [$event.nombre, $event.valor];
        campo.estadoToggle = this.dado1Sel ? 'sel1' : 'sel2';
        this.dado1Sel = !this.dado1Sel;
    }
    console.table(this.dados);
  }

  ngAfterViewInit() {
  }
}
