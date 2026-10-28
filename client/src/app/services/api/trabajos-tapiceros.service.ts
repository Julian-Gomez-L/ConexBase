import { Injectable } from '@angular/core';
import { TrabajoTapicero } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class TrabajosTapicerosService extends CrudService<TrabajoTapicero> {
  protected readonly endpoint = 'trabajos-tapiceros';
}
