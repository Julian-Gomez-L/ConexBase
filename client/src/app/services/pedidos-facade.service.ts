import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import {
  ClientesService,
  DetallePedidosService,
  HistorialPedidosService,
  PagosService,
  PedidosService,
  ProductosService,
  UsuariosService,
} from '@app/services/api';
import { construirVistas, DatosPedidos, PedidoVista } from '@app/models/pedido-vista.model';

/**
 * Fachada: junta 7 recursos de la API en UNA sola llamada para la pantalla.
 * Las 7 peticiones salen en paralelo (forkJoin), no una tras otra.
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
  private readonly historial = inject(HistorialPedidosService);

  listarVista(): Observable<PedidoVista[]> {
    return this.listarConDatos().pipe(map((r) => r.vistas));
  }

  /** Las vistas y, además, los datos crudos (historial, usuarios…) para reportes. */
  listarConDatos(): Observable<{ vistas: PedidoVista[]; datos: Required<DatosPedidos> }> {
    return forkJoin({
      pedidos: this.pedidos.listar(),
      clientes: this.clientes.listar(),
      usuarios: this.usuarios.listar(),
      detalles: this.detalles.listar(),
      productos: this.productos.listar(),
      pagos: this.pagos.listar(),
      historial: this.historial.listar(),
    }).pipe(map((datos) => ({ vistas: construirVistas(datos), datos })));
  }
}
