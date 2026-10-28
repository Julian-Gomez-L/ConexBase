import { Injectable } from '@angular/core';
import { HistorialPedido } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class HistorialPedidosService extends CrudService<HistorialPedido> {
  protected readonly endpoint = 'historial-pedidos';
}
