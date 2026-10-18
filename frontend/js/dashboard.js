/**
 * CONTROLADOR DEL DASHBOARD (index.html)
 */

import { obtenerTurnos, comprobarEstado } from './api.js';
import { initNavigation } from './navigation.js';
import { escapeHtml, formatId, getInitials, formatFechaHora } from './utils.js';
import { renderSkeletonTable, renderEmptyState, renderErrorBanner, ICONS } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('dashboard');
  cargarDatosDashboard();

  const retryBtn = document.getElementById('btn-retry-dashboard');
  if (retryBtn) {
    retryBtn.addEventListener('click', cargarDatosDashboard);
  }
});

async function cargarDatosDashboard() {
  const statTotal = document.getElementById('stat-total-turnos');
  const statEstado = document.getElementById('stat-estado-backend');
  const statServicios = document.getElementById('stat-servicios-activos');
  const tableBody = document.getElementById('dashboard-recent-turnos-body');
  const emptyContainer = document.getElementById('dashboard-empty-container');
  const tableWrapper = document.getElementById('dashboard-table-wrapper');
  const errorContainer = document.getElementById('dashboard-error-container');
  const servicesList = document.getElementById('dashboard-services-list');

  // Limpiar errores
  if (errorContainer) errorContainer.innerHTML = '';

  // Estado de carga inicial
  if (tableBody) {
    tableBody.innerHTML = renderSkeletonTable(3, 4);
  }

  try {
    // Peticiones reales al backend
    const [turnos, estado] = await Promise.all([
      obtenerTurnos(),
      comprobarEstado().catch(err => ({ error: true, mensaje: 'Sin respuesta' }))
    ]);

    // 1. Métrica: Total de turnos
    const total = Array.isArray(turnos) ? turnos.length : 0;
    if (statTotal) {
      statTotal.textContent = total;
    }

    // 2. Métrica: Estado de FastAPI
    if (statEstado) {
      if (estado && !estado.error) {
        statEstado.innerHTML = `<span class="text-success font-medium">Activo</span>`;
      } else {
        statEstado.innerHTML = `<span class="text-error font-medium">Desconectado</span>`;
      }
    }

    // 3. Métrica: Servicios únicos derivados de los turnos reales
    const serviciosContador = {};
    if (Array.isArray(turnos)) {
      turnos.forEach(t => {
        const serv = (t.servicio || 'Sin especificar').trim();
        serviciosContador[serv] = (serviciosContador[serv] || 0) + 1;
      });
    }

    const serviciosUnicos = Object.keys(serviciosContador);
    if (statServicios) {
      statServicios.textContent = serviciosUnicos.length;
    }

    // Render de desglose de servicios reales
    if (servicesList) {
      if (serviciosUnicos.length === 0) {
        servicesList.innerHTML = `
          <div style="padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--text-xs);">
            No hay servicios registrados aún
          </div>
        `;
      } else {
        servicesList.innerHTML = serviciosUnicos
          .map(servicio => `
            <div class="service-dist-item">
              <span class="service-dist-name">${escapeHtml(servicio)}</span>
              <span class="badge badge-neutral">${serviciosContador[servicio]} ${serviciosContador[servicio] === 1 ? 'turno' : 'turnos'}</span>
            </div>
          `)
          .join('');
      }
    }

    // 4. Últimos turnos registrados (los últimos 5 por ID descendente)
    if (total === 0) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (emptyContainer) {
        emptyContainer.innerHTML = renderEmptyState({
          icon: ICONS.calendar,
          title: 'Aún no hay turnos anotados',
          description: 'Empezá anotando el primer turno para tu negocio y organizá tus citas al día.',
          actionText: 'Anotar Primer Turno',
          actionHref: 'pages/crear-turno.html'
        });
        emptyContainer.style.display = 'block';
      }
    } else {
      if (emptyContainer) emptyContainer.style.display = 'none';
      if (tableWrapper) tableWrapper.style.display = 'block';

      // Ordenar por ID descendente para ver los más recientes
      const turnosRecientes = [...turnos].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);

      if (tableBody) {
        tableBody.innerHTML = turnosRecientes.map(turno => `
          <tr class="turno-card-row">
            <td class="td-id">
              <span class="badge badge-neutral font-mono">${formatId(turno.id)}</span>
            </td>
            <td class="td-customer">
              <div class="cell-customer">
                <div class="customer-avatar">${getInitials(turno.nombre_cliente)}</div>
                <div style="display: flex; flex-direction: column;">
                  <span class="font-medium text-main customer-name">${escapeHtml(turno.nombre_cliente)}</span>
                </div>
              </div>
            </td>
            <td class="td-service">
              <span class="mobile-label">Servicio</span>
              <span class="badge badge-primary">${escapeHtml(turno.servicio)}</span>
            </td>
            <td class="td-datetime">
              <span class="mobile-label">Horario</span>
              <span class="badge badge-neutral font-mono badge-datetime" style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${escapeHtml(formatFechaHora(turno.fecha_hora))}
              </span>
            </td>
            <td class="td-actions">
              <div class="table-actions">
                <a href="pages/detalle-turno.html?id=${encodeURIComponent(turno.id)}" class="btn btn-secondary btn-sm" title="Ver ficha">
                  ${ICONS.eye} <span>Ficha</span>
                </a>
                <a href="pages/editar-turno.html?id=${encodeURIComponent(turno.id)}" class="btn btn-secondary btn-sm" title="Modificar">
                  ${ICONS.edit} <span>Modificar</span>
                </a>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyContainer) emptyContainer.style.display = 'none';

    if (errorContainer) {
      errorContainer.innerHTML = renderErrorBanner({
        message: error.message || 'No se pudo comunicar con FastAPI.',
        retryId: 'btn-retry-dash'
      });

      const btn = document.getElementById('btn-retry-dash');
      if (btn) {
        btn.addEventListener('click', cargarDatosDashboard);
      }
    }
  }
}
