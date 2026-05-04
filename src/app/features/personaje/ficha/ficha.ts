import {AfterViewInit, Component, numberAttribute, QueryList, ViewChildren} from '@angular/core';
import {Puntos, ToggleDatos} from '../../../shared/components/puntos/puntos';

@Component({
  selector: 'app-ficha',
  imports: [
    Puntos
  ],
  templateUrl: './ficha.html',
  styleUrl: './ficha.css',
})

export class Ficha implements AfterViewInit {
  private dados: [string, number][] = [];
  private dado1Sel = true;
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
