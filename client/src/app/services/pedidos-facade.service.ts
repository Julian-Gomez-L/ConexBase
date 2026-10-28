import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  ClientesService,
  DetallePedidosService,
  PagosService,
  PedidosService,
  ProductosService,
  UsuariosService,
} from '@app/services/api';
import { construirVistas, PedidoVista } from '@app/models/pedido-vista.model';

/**
 * Fachada: junta 6 recursos de la API en UNA sola llamada para la pantalla.
 * Las 6 peticiones salen en paralelo (forkJoin), no una tras otra.
 *
 * Mejora futura en el backend: `GET /pedidos?with=cliente,detallePedidos.producto,pagos`
 * (Eloquent `with()`) y esta fachada se reduce a una sola petición.
 */
@Injectable({ providedIn: 'root' })
export class PedidosFacadeService {
  private readonly pedidos = inject(PedidosService);
  private readonly clientes = inject(ClientesService);
  private readonly usuarios = inject(UsuariosService);
  private readonly detalles = inject(DetallePedidosService);
  private readonly productos = inject(ProductosService);
  private readonly pagos = inject(PagosService);

  listarVista(): Observable<PedidoVista[]> {
    return forkJoin({
      pedidos: this.pedidos.listar(),
      clientes: this.clientes.listar(),
      usuarios: this.usuarios.listar(),
      detalles: this.detalles.listar(),
      productos: this.productos.listar(),
      pagos: this.pagos.listar(),
    }).pipe(map(construirVistas));
  }
}
