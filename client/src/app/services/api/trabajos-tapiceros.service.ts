import { Injectable } from '@angular/core';
import { Actualizar, Crear, TrabajoTapicero } from '@app/models';
import { CrudService } from '@app/services/crud.service';

/** Al actualizar se puede mandar `revisado` (solo el Administrador): el servidor llena revisado_en/revisado_por. */
export type ActualizarTrabajo = Actualizar<TrabajoTapicero> & { revisado?: boolean };

@Injectable({ providedIn: 'root' })
export class TrabajosTapicerosService extends CrudService<
  TrabajoTapicero,
  Crear<TrabajoTapicero>,
  ActualizarTrabajo
> {
  protected readonly endpoint = 'trabajos-tapiceros';
}
