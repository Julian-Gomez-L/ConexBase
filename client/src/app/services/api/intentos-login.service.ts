import { Injectable } from '@angular/core';
import { IntentoLogin } from '@app/models';
import { CrudService } from '@app/services/crud.service';

/**
 * Intentos de inicio de sesión fallidos (solo Administrador).
 * La API solo ofrece listar: los registros no se crean ni se editan desde aquí,
 * los guarda el backend cuando un login falla.
 */
@Injectable({ providedIn: 'root' })
export class IntentosLoginService extends CrudService<IntentoLogin> {
  protected readonly endpoint = 'intentos-login';
}
