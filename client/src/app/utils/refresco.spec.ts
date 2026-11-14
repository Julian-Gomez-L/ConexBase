import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refrescoAutomatico } from './refresco';

describe('refrescoAutomatico', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('recarga cada intervalo, se pausa cuando se pide y se detiene al destruir', () => {
    const accion = vi.fn();
    let pausado = false;
    TestBed.runInInjectionContext(() => refrescoAutomatico(accion, () => pausado, 1000));

    vi.advanceTimersByTime(3000);
    expect(accion).toHaveBeenCalledTimes(3);

    pausado = true;
    vi.advanceTimersByTime(2000);
    expect(accion).toHaveBeenCalledTimes(3);

    pausado = false;
    TestBed.resetTestingModule(); // destruye el inyector → se limpia el intervalo
    vi.advanceTimersByTime(5000);
    expect(accion).toHaveBeenCalledTimes(3);
  });
});
