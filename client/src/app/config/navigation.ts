import {
  LucideCalendarDays,
  LucideCheckCircle,
  LucideCircleDollarSign,
  LucideFactory,
  LucideFileText,
  LucideIconData,
  LucideLayoutDashboard,
  LucidePackage,
  LucidePlusCircle,
  LucideScissors,
  LucideShoppingCart,
  LucideUsers,
} from '@lucide/angular';
import { AppRole } from './roles';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIconData;
}

/** Menú lateral por rol. Replica el DashboardLayout.tsx del ZIP de referencia. */
export const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  vendedor: [
    { path: '/dashboard/crear-pedido', label: 'Crear Pedido', icon: LucidePlusCircle.icon },
    { path: '/dashboard/mis-pedidos', label: 'Mis Pedidos', icon: LucidePackage.icon },
    {
      path: '/dashboard/mis-comisiones',
      label: 'Mis Comisiones',
      icon: LucideCircleDollarSign.icon,
    },
    {
      path: '/dashboard/ventas-confirmadas',
      label: 'Ventas Confirmadas',
      icon: LucideCheckCircle.icon,
    },
    { path: '/dashboard/consolidado', label: 'Consolidado', icon: LucideFileText.icon },
    { path: '/dashboard/pedidos-del-dia', label: 'Pedidos del Día', icon: LucideCalendarDays.icon },
  ],
  administrador: [
    { path: '/dashboard', label: 'Panel General', icon: LucideLayoutDashboard.icon },
    { path: '/dashboard/ventas', label: 'Ventas', icon: LucideShoppingCart.icon },
    { path: '/dashboard/confirmacion', label: 'Confirmación', icon: LucideCheckCircle.icon },
    { path: '/dashboard/fabricacion', label: 'Fabricación', icon: LucideFactory.icon },
    { path: '/dashboard/pedidos-del-dia', label: 'Pedidos del Día', icon: LucideCalendarDays.icon },
    {
      path: '/dashboard/comisiones-asesores',
      label: 'Comisiones de Asesores',
      icon: LucideCircleDollarSign.icon,
    },
    { path: '/dashboard/consolidado', label: 'Consolidado', icon: LucideFileText.icon },
    { path: '/dashboard/usuarios', label: 'Usuarios y Roles', icon: LucideUsers.icon },
  ],
  confirmador: [
    { path: '/dashboard/confirmacion', label: 'Confirmación', icon: LucideCheckCircle.icon },
    { path: '/dashboard/pedidos-del-dia', label: 'Pedidos del Día', icon: LucideCalendarDays.icon },
    { path: '/dashboard/consolidado', label: 'Consolidado', icon: LucideFileText.icon },
  ],
  produccion: [
    { path: '/dashboard/fabricacion', label: 'Fabricación', icon: LucideFactory.icon },
    { path: '/dashboard/pedidos-del-dia', label: 'Pedidos del Día', icon: LucideCalendarDays.icon },
    { path: '/dashboard/consolidado', label: 'Consolidado', icon: LucideFileText.icon },
  ],
  tapicero: [{ path: '/dashboard/tapicero', label: 'Mis Productos', icon: LucideScissors.icon }],
};

/** Pantalla de inicio de cada rol (el Panel General es solo del administrador). */
export const ROLE_HOME: Record<AppRole, string> = {
  administrador: '/dashboard',
  vendedor: '/dashboard/crear-pedido',
  confirmador: '/dashboard/confirmacion',
  produccion: '/dashboard/fabricacion',
  tapicero: '/dashboard/tapicero',
};
