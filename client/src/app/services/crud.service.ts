import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { Actualizar, ApiResponse, Crear, RegistroBase } from '@app/models';

/**
 * CRUD genérico para cualquier recurso `apiResource` de Laravel.
 * Cada entidad solo declara su `endpoint`: es el mismo patrón por capas del backend.
 *
 *   GET    /endpoint        → listar()
 *   GET    /endpoint/{id}   → obtener(id)
 *   POST   /endpoint        → crear(dto)
 *   PUT    /endpoint/{id}   → actualizar(id, dto)
 *   DELETE /endpoint/{id}   → eliminar(id)   (borrado lógico en el servidor)
 */
export abstract class CrudService<
  T extends RegistroBase,
  TCrear = Crear<T>,
  TActualizar = Actualizar<T>,
> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  protected get url(): string {
    return `${environment.apiUrl}/${this.endpoint}`;
  }

  listar(): Observable<T[]> {
    return this.http.get<ApiResponse<T[]>>(this.url).pipe(map((r) => r.data));
  }

  obtener(id: number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  crear(dto: TCrear): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.url, dto).pipe(map((r) => r.data));
  }

  actualizar(id: number, dto: TActualizar): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.url}/${id}`, dto).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
