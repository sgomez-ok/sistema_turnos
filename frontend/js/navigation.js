/**
 * NAVEGACIÓN Y COMPORTAMIENTO GLOBAL DE LA APLICACIÓN
 * Manejo de sidebar persistente, menú responsive y monitor de estado del backend
 */

import { comprobarEstado } from './api.js';

/**
 * Inicializa la navegación, resalta la página activa y arranca el heartbeat del backend.
 * @param {'dashboard'|'turnos'|'crear'|'detalle'|'editar'|'configuracion'} pageKey
 */
export function initNavigation(pageKey) {
  // 1. Resaltar enlace activo en sidebar
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === pageKey) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. Control de menú móvil (Drawer)
  const menuBtn = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (menuBtn && sidebar && overlay) {
    const toggleMenu = () => {
      sidebar.classList.toggle('is-open');
      overlay.classList.toggle('active');
    };

    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
  }

  // 3. Monitor de estado del backend (Heartbeat)
  checkBackendHealth();
  setInterval(checkBackendHealth, 25000); // Cada 25s
}

/**
 * Verifica el estado del backend mediante GET /estado y actualiza los indicadores visuales.
 */
export async function checkBackendHealth() {
  const statusDots = document.querySelectorAll('.backend-status-card .status-dot, .backend-status-pill .status-dot');
  const statusLabels = document.querySelectorAll('.backend-status-card .status-label, .backend-status-pill .status-label');
  const statusSubs = document.querySelectorAll('.backend-status-card .status-sub');

  try {
    const result = await comprobarEstado();
    statusDots.forEach(dot => {
      dot.className = 'status-dot connected';
    });
    statusLabels.forEach(label => {
      label.textContent = 'Sistema Conectado';
    });
    statusSubs.forEach(sub => {
      sub.textContent = 'Listo para usar';
    });
    return true;
  } catch (error) {
    statusDots.forEach(dot => {
      dot.className = 'status-dot disconnected';
    });
    statusLabels.forEach(label => {
      label.textContent = 'Sin Conexión';
    });
    statusSubs.forEach(sub => {
      sub.textContent = 'Revisá que el servidor esté abierto';
    });
    return false;
  }
}
