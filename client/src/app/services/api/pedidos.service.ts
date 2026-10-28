import { Injectable } from '@angular/core';
import { Pedido } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class PedidosService extends CrudService<Pedido> {
  protected readonly endpoint = 'pedidos';
}
