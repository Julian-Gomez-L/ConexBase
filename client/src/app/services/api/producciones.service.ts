import { Injectable } from '@angular/core';
import { Produccion } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class ProduccionesService extends CrudService<Produccion> {
  protected readonly endpoint = 'producciones';
}
