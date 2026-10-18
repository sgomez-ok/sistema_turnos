/**
 * CONTROLADOR DE GESTIÓN DE TURNOS (turnos.html)
 */

import { obtenerTurnos, eliminarTurno } from './api.js';
import { initNavigation } from './navigation.js';
import { escapeHtml, formatId, getInitials, debounce, formatFechaHora } from './utils.js';
import {
  renderSkeletonTable,
  renderEmptyState,
  renderErrorBanner,
  showToast,
  showConfirmModal,
  ICONS
} from './components.js';

// Estado en memoria para filtrado y ordenamiento en cliente
let listaTurnos = [];
let busquedaActual = '';
let ordenActual = 'id-desc'; // 'id-desc' | 'id-asc' | 'nombre-asc' | 'nombre-desc'

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('turnos');
  inicializarEventos();
  cargarTurnos();
});

function inicializarEventos() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const sortSelect = document.getElementById('sort-select');
  const refreshBtn = document.getElementById('btn-refresh-turnos');

  if (searchInput) {
    const handleSearch = debounce((e) => {
      busquedaActual = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = busquedaActual ? 'block' : 'none';
      }
      renderizarTabla();
    }, 200);

    searchInput.addEventListener('input', handleSearch);
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      busquedaActual = '';
      clearSearchBtn.style.display = 'none';
      renderizarTabla();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      ordenActual = e.target.value;
      renderizarTabla();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      cargarTurnos();
    });
  }

  // Delegación de eventos para acciones en la tabla
  const tableBody = document.getElementById('turnos-table-body');
  if (tableBody) {
    tableBody.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.btn-action-delete');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const nombre = deleteBtn.getAttribute('data-nombre');
        const servicio = deleteBtn.getAttribute('data-servicio');
        const fecha = deleteBtn.getAttribute('data-fecha');
        confirmarEliminarTurno(id, nombre, servicio, fecha);
      }
    });
  }
}

/**
 * Carga la lista completa de turnos desde FastAPI.
 */
async function cargarTurnos() {
  const tableBody = document.getElementById('turnos-table-body');
  const emptyContainer = document.getElementById('turnos-empty-container');
  const errorContainer = document.getElementById('turnos-error-container');
  const tableWrapper = document.getElementById('turnos-table-wrapper');
  const resultsBadge = document.getElementById('results-count');

  if (errorContainer) errorContainer.innerHTML = '';
  if (emptyContainer) emptyContainer.style.display = 'none';
  if (tableWrapper) tableWrapper.style.display = 'block';

  if (tableBody) {
    tableBody.innerHTML = renderSkeletonTable(4, 4);
  }

  try {
    const data = await obtenerTurnos();
    listaTurnos = Array.isArray(data) ? data : [];
    renderizarTabla();
  } catch (error) {
    console.error('Error al cargar turnos:', error);
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (resultsBadge) resultsBadge.textContent = 'Error de conexión';

    if (errorContainer) {
      errorContainer.innerHTML = renderErrorBanner({
        message: error.message || 'No se pudieron recuperar los turnos del servidor.',
        retryId: 'btn-retry-list'
      });

      const retryBtn = document.getElementById('btn-retry-list');
      if (retryBtn) {
        retryBtn.addEventListener('click', cargarTurnos);
      }
    }
  }
}

/**
 * Aplica búsqueda, ordenamiento y renderiza los elementos en el DOM.
 */
function renderizarTabla() {
  const tableBody = document.getElementById('turnos-table-body');
  const emptyContainer = document.getElementById('turnos-empty-container');
  const tableWrapper = document.getElementById('turnos-table-wrapper');
  const resultsBadge = document.getElementById('results-count');

  if (!tableBody) return;

  // 1. Filtrado
  let turnosFiltrados = listaTurnos.filter(turno => {
    if (!busquedaActual) return true;
    const matchNombre = String(turno.nombre_cliente || '').toLowerCase().includes(busquedaActual);
    const matchServicio = String(turno.servicio || '').toLowerCase().includes(busquedaActual);
    const matchFecha = String(turno.fecha_hora || '').toLowerCase().includes(busquedaActual) || formatFechaHora(turno.fecha_hora).toLowerCase().includes(busquedaActual);
    const matchId = String(turno.id || '').includes(busquedaActual) || formatId(turno.id).toLowerCase().includes(busquedaActual);
    return matchNombre || matchServicio || matchId || matchFecha;
  });

  // 2. Ordenamiento
  turnosFiltrados.sort((a, b) => {
    if (ordenActual === 'id-desc') return Number(b.id) - Number(a.id);
    if (ordenActual === 'id-asc') return Number(a.id) - Number(b.id);
    if (ordenActual === 'fecha-asc') return String(a.fecha_hora || '').localeCompare(String(b.fecha_hora || ''));
    if (ordenActual === 'fecha-desc') return String(b.fecha_hora || '').localeCompare(String(a.fecha_hora || ''));
    if (ordenActual === 'nombre-asc') return String(a.nombre_cliente).localeCompare(String(b.nombre_cliente));
    if (ordenActual === 'nombre-desc') return String(b.nombre_cliente).localeCompare(String(a.nombre_cliente));
    return 0;
  });

  // 3. Actualizar contador
  if (resultsBadge) {
    if (listaTurnos.length === 0) {
      resultsBadge.textContent = '0 turnos';
    } else if (busquedaActual) {
      resultsBadge.textContent = `Mostrando ${turnosFiltrados.length} de ${listaTurnos.length} turnos`;
    } else {
      resultsBadge.textContent = `Total: ${listaTurnos.length} ${listaTurnos.length === 1 ? 'turno' : 'turnos'}`;
    }
  }

  // 4. Caso: Base de datos sin turnos
  if (listaTurnos.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyContainer) {
      emptyContainer.innerHTML = renderEmptyState({
        icon: ICONS.inbox,
        title: 'Todavía no hay turnos anotados',
        description: 'La agenda está vacía. Empezá anotando el primer turno para tu negocio.',
        actionText: 'Anotar Primer Turno',
        actionHref: 'crear-turno.html'
      });
      emptyContainer.style.display = 'block';
    }
    return;
  }

  // 5. Caso: Búsqueda sin coincidencias
  if (turnosFiltrados.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyContainer) {
      emptyContainer.innerHTML = renderEmptyState({
        icon: ICONS.alertCircle,
        title: 'No encontramos ningún turno',
        description: `No hay turnos que coincidan con "${escapeHtml(busquedaActual)}".`,
        actionText: 'Borrar búsqueda',
        actionId: 'btn-reset-search-empty'
      });
      emptyContainer.style.display = 'block';

      const resetBtn = document.getElementById('btn-reset-search-empty');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          const searchInput = document.getElementById('search-input');
          const clearSearchBtn = document.getElementById('clear-search-btn');
          if (searchInput) searchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          busquedaActual = '';
          renderizarTabla();
        });
      }
    }
    return;
  }

  // 6. Renderizar filas
  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyContainer) emptyContainer.style.display = 'none';

  tableBody.innerHTML = turnosFiltrados.map(turno => `
    <tr id="row-turno-${turno.id}" class="turno-card-row">
      <td class="td-id">
        <span class="badge badge-neutral font-mono">${formatId(turno.id)}</span>
      </td>
      <td class="td-customer">
        <div class="cell-customer">
          <div class="customer-avatar">${getInitials(turno.nombre_cliente)}</div>
          <span class="font-medium text-main customer-name">${escapeHtml(turno.nombre_cliente)}</span>
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
          <a href="detalle-turno.html?id=${encodeURIComponent(turno.id)}" class="btn btn-secondary btn-sm" title="Ver ficha">
            ${ICONS.eye}
            <span>Ficha</span>
          </a>
          <a href="editar-turno.html?id=${encodeURIComponent(turno.id)}" class="btn btn-secondary btn-sm" title="Modificar turno">
            ${ICONS.edit}
            <span>Modificar</span>
          </a>
          <button type="button" class="btn btn-secondary btn-sm btn-action-delete text-error" 
                  data-id="${escapeHtml(turno.id)}" 
                  data-nombre="${escapeHtml(turno.nombre_cliente)}" 
                  data-servicio="${escapeHtml(turno.servicio)}"
                  data-fecha="${escapeHtml(formatFechaHora(turno.fecha_hora))}"
                  title="Borrar turno">
            ${ICONS.trash}
            <span class="sr-only">Borrar</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Abre el modal de confirmación antes de eliminar.
 */
function confirmarEliminarTurno(id, nombre, servicio, fechaHora) {
  const fechaTexto = fechaHora ? ` para el día <strong class="text-main">${escapeHtml(fechaHora)}</strong>` : '';
  showConfirmModal({
    title: `¿Borrar el Turno ${formatId(id)}?`,
    message: `¿Estás seguro de que querés borrar el turno de <strong class="text-main">${escapeHtml(nombre)}</strong> para <strong class="text-main">${escapeHtml(servicio)}</strong>${fechaTexto}?<br><br><span class="text-muted" style="font-size: 13px;">Esta acción borrará el turno de la agenda y no se puede recuperar.</span>`,
    confirmText: 'Sí, borrar turno',
    cancelText: 'No, conservar',
    danger: true,
    onConfirm: async () => {
      try {
        const respuesta = await eliminarTurno(id);
        
        // Actualizar lista en memoria
        listaTurnos = listaTurnos.filter(t => String(t.id) !== String(id));
        renderizarTabla();

        showToast({
          title: '¡Turno Borrado!',
          message: respuesta.mensaje || `El turno ${formatId(id)} fue eliminado de la agenda.`,
          type: 'success'
        });
      } catch (error) {
        showToast({
          title: 'No se pudo borrar',
          message: error.message || 'Hubo un problema al intentar borrar el turno.',
          type: 'error'
        });
        throw error;
      }
    }
  });
}
