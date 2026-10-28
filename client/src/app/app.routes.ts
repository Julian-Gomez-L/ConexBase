import { Routes } from '@angular/router';
import { authGuard, guestGuard, inicioPorRolGuard, rolesPermitidos } from '@app/guards/auth.guard';

/** Carga perezosa (lazy) de componentes: solo se descargan cuando se visita la ruta. */
const pedidosLista = () =>
  import('@app/pages/pedidos/pedidos.component').then((m) => m.PedidosComponent);
const enConstruccion = () =>
  import('@app/components/en-construccion/en-construccion.component').then((m) => m.EnConstruccionComponent);

/**
 * Mapa de acceso (replica routes.tsx + DashboardLayout.tsx de la maqueta).
 * `canMatch` impide incluso descargar el código de una pantalla si el rol no corresponde.
 * `data` llega como @Input() al componente (withComponentInputBinding).
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · ConexBase',
    loadComponent: () => import('@app/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@app/layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      // Panel General: solo administrador (los demás roles son redirigidos a su inicio)
      {
        path: '',
        pathMatch: 'full',
        canActivate: [inicioPorRolGuard],
        title: 'Panel General · ConexBase',
        loadComponent: () =>
          import('@app/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // ── Asesor comercial ────────────────────────────────────────────
      {
        path: 'crear-pedido',
        canMatch: [rolesPermitidos('vendedor')],
        title: 'Crear Pedido · ConexBase',
        loadComponent: () =>
          import('@app/pages/crear-pedido/crear-pedido.component').then((m) => m.CrearPedidoComponent),
      },
      {
        path: 'mis-pedidos',
        canMatch: [rolesPermitidos('vendedor')],
        title: 'Mis Pedidos · ConexBase',
        loadComponent: pedidosLista,
        data: {
          alcance: 'propios',
          titulo: 'Mis Pedidos',
          descripcion: 'Visualiza todos tus pedidos creados',
        },
      },
      {
        path: 'mis-comisiones',
        canMatch: [rolesPermitidos('vendedor')],
        title: 'Mis Comisiones · ConexBase',
        loadComponent: () =>
          import('@app/pages/mis-comisiones/mis-comisiones.component').then(
            (m) => m.MisComisionesComponent,
          ),
      },
      {
        path: 'ventas-confirmadas',
        canMatch: [rolesPermitidos('vendedor')],
        title: 'Ventas Confirmadas · ConexBase',
        loadComponent: pedidosLista,
        data: {
          alcance: 'propios',
          titulo: 'Ventas Confirmadas',
          descripcion: 'Tus pedidos aprobados por confirmación, en fabricación o entregados',
          estadosIncluidos: ['Confirmado', 'En producción', 'Finalizado', 'Entregado'],
        },
      },

      // ── Compartidas ─────────────────────────────────────────────────
      {
        path: 'consolidado',
        canMatch: [rolesPermitidos('administrador', 'vendedor', 'confirmador', 'produccion')],
        loadComponent: enConstruccion,
        data: { titulo: 'Consolidado' },
      },
      {
        path: 'pedidos-del-dia',
        canMatch: [rolesPermitidos('administrador', 'vendedor', 'confirmador', 'produccion')],
        loadComponent: enConstruccion,
        data: { titulo: 'Pedidos del Día' },
      },

      // ── Administración / confirmación / fabricación ─────────────────
      {
        path: 'ventas',
        canMatch: [rolesPermitidos('administrador')],
        title: 'Ventas · ConexBase',
        loadComponent: pedidosLista,
        data: {
          alcance: 'todos',
          titulo: 'Ventas',
          descripcion: 'Todos los pedidos registrados en el sistema',
        },
      },
      {
        path: 'confirmacion',
        canMatch: [rolesPermitidos('administrador', 'confirmador')],
        title: 'Confirmación · ConexBase',
        loadComponent: () =>
          import('@app/pages/confirmacion/confirmacion.component').then((m) => m.ConfirmacionComponent),
      },
      {
        path: 'fabricacion',
        canMatch: [rolesPermitidos('administrador', 'produccion')],
        loadComponent: enConstruccion,
        data: { titulo: 'Fabricación' },
      },
      {
        path: 'comisiones-asesores',
        canMatch: [rolesPermitidos('administrador')],
        loadComponent: enConstruccion,
        data: { titulo: 'Comisiones de Asesores' },
      },
      {
        path: 'usuarios',
        canMatch: [rolesPermitidos('administrador')],
        loadComponent: enConstruccion,
        data: { titulo: 'Usuarios y Roles' },
      },

      // ── Tapicero ────────────────────────────────────────────────────
      {
        path: 'tapicero',
        canMatch: [rolesPermitidos('tapicero')],
        loadComponent: enConstruccion,
        data: { titulo: 'Mis Productos' },
      },

      { path: '**', redirectTo: '' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
