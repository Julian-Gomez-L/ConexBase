import { Injectable } from '@angular/core';
import { Cliente } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class ClientesService extends CrudService<Cliente> {
  protected readonly endpoint = 'clientes';
}
