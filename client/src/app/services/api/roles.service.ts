import { Injectable } from '@angular/core';
import { Rol } from '@app/models';
import { CrudService } from '@app/services/crud.service';

@Injectable({ providedIn: 'root' })
export class RolesService extends CrudService<Rol> {
  protected readonly endpoint = 'roles';
}
