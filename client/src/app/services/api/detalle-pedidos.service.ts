import { Injectable } from '@angular/core';
import { DetallePedido } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class DetallePedidosService extends CrudService<DetallePedido> {
  protected readonly endpoint = 'detalle-pedidos';
}
