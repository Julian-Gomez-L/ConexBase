import { Injectable } from '@angular/core';
import { Usuario, UsuarioPayload } from '@app/models';
import { CrudService } from '@app/services/crud.service';

/** Usuarios es la única entidad cuyo payload incluye `password` (nunca viene en las respuestas). */
@Injectable({ providedIn: 'root' })
export class UsuariosService extends CrudService<Usuario, UsuarioPayload, Partial<UsuarioPayload>> {
  protected readonly endpoint = 'usuarios';
}
