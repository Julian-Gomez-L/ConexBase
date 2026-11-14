import { DestroyRef, inject } from '@angular/core';

/** Cada cuánto se vuelven a pedir los datos a la API. */
export const INTERVALO_REFRESCO_MS = 15_000;

/**
 * Vuelve a cargar los datos de la pantalla sin recargar la página:
 * - cada `intervaloMs` (15 s), solo mientras la pestaña está visible;
 * - en cuanto el usuario vuelve a la pestaña o a la ventana.
 * No refresca mientras `pausar()` devuelva true (ej. mientras se guarda algo).
 * Se detiene solo al salir de la pantalla.
 *
 * Debe llamarse en un contexto de inyección (inicializador de un campo o
 * constructor), por ejemplo:
 *   private readonly refresco = refrescoAutomatico(() => this.cargar(true));
 */
export function refrescoAutomatico(
  accion: () => void,
  pausar: () => boolean = () => false,
  intervaloMs = INTERVALO_REFRESCO_MS,
): void {
  const destroyRef = inject(DestroyRef);
  if (typeof document === 'undefined') return;

  let ultimo = Date.now();
  const ejecutar = () => {
    if (document.visibilityState !== 'visible' || pausar()) return;
    ultimo = Date.now();
    accion();
  };
  // Al volver a la pestaña: refresca ya, salvo que lo haya hecho hace muy poco
  const alVolver = () => {
    if (Date.now() - ultimo > 2_000) ejecutar();
  };

  const id = setInterval(ejecutar, intervaloMs);
  document.addEventListener('visibilitychange', alVolver);
  window.addEventListener('focus', alVolver);
  destroyRef.onDestroy(() => {
    clearInterval(id);
    document.removeEventListener('visibilitychange', alVolver);
    window.removeEventListener('focus', alVolver);
  });
}
