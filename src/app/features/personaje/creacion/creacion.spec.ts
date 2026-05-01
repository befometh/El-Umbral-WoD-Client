import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creacion } from './creacion';

describe('Creacion', () => {
  let component: Creacion;
  let fixture: ComponentFixture<Creacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Creacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
