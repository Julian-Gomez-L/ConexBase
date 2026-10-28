import { Injectable } from '@angular/core';
import { Pago } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class PagosService extends CrudService<Pago> {
  protected readonly endpoint = 'pagos';
}
