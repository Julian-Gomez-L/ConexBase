import { Routes } from '@angular/router';
import { authGuard, guestGuard, inicioPorRolGuard, rolesPermitidos } from '@app/guards/auth.guard';

/** Carga perezosa (lazy) de componentes: solo se descargan cuando se visita la ruta. */
const pedidosLista = () =>
  import('@app/pages/pedidos/pedidos.component').then((m) => m.PedidosComponent);
// Para una pantalla nueva aún sin hacer, usa:
//   loadComponent: () => import('@app/components/en-construccion/en-construccion.component')
//     .then((m) => m.EnConstruccionComponent), data: { titulo: '…' }

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
        title: 'Consolidado · ConexBase',
        loadComponent: () => import('@app/pages/consolidado/consolidado.component').then((m) => m.ConsolidadoComponent),
      },
      {
        path: 'pedidos-del-dia',
        canMatch: [rolesPermitidos('administrador', 'vendedor', 'confirmador', 'produccion')],
        title: 'Pedidos del Día · ConexBase',
        loadComponent: () => import('@app/pages/pedidos-del-dia/pedidos-del-dia.component').then((m) => m.PedidosDelDiaComponent),
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
        title: 'Fabricación · ConexBase',
        loadComponent: () =>
          import('@app/pages/fabricacion/fabricacion.component').then((m) => m.FabricacionComponent),
      },
      {
        path: 'comisiones-asesores',
        canMatch: [rolesPermitidos('administrador')],
        title: 'Comisiones de Asesores · ConexBase',
        loadComponent: () => import('@app/pages/comisiones-asesores/comisiones-asesores.component').then((m) => m.ComisionesAsesoresComponent),
      },
      {
        path: 'usuarios',
        canMatch: [rolesPermitidos('administrador')],
        title: 'Usuarios y Roles · ConexBase',
        loadComponent: () => import('@app/pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },

      // ── Tapicero ────────────────────────────────────────────────────
      {
        path: 'tapicero',
        canMatch: [rolesPermitidos('tapicero')],
        title: 'Mis Productos · ConexBase',
        loadComponent: () =>
          import('@app/pages/mis-productos/mis-productos.component').then((m) => m.MisProductosComponent),
      },

      { path: '**', redirectTo: '' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
