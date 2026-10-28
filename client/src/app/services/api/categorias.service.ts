import { Injectable } from '@angular/core';
import { Categoria } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class CategoriasService extends CrudService<Categoria> {
  protected readonly endpoint = 'categorias';
}
