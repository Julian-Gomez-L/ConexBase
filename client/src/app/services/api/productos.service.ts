import { Injectable } from '@angular/core';
import { Producto } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class ProductosService extends CrudService<Producto> {
  protected readonly endpoint = 'productos';
}
