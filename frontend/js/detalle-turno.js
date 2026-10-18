/**
 * CONTROLADOR DE DETALLE DE TURNO (detalle-turno.html)
 */

import { obtenerTurnoPorId, eliminarTurno } from './api.js';
import { initNavigation } from './navigation.js';
import { getUrlParam, formatId, getInitials, escapeHtml, formatFechaHora } from './utils.js';
import { showToast, showConfirmModal, renderErrorBanner, ICONS } from './components.js';

let turnoActual = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('turnos');
  cargarDetalle();
});

async function cargarDetalle() {
  const turnoId = getUrlParam('id');
  const cardContainer = document.getElementById('detail-card-container');
  const errorContainer = document.getElementById('detail-error-container');

  if (errorContainer) errorContainer.innerHTML = '';

  if (!turnoId) {
    if (cardContainer) cardContainer.style.display = 'none';
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-warning">
          ${ICONS.alertTriangle}
          <div style="flex: 1;">
            <strong>Falta el identificador</strong>
            <p>No se especificó ningún ID de turno en la dirección URL.</p>
          </div>
          <a href="turnos.html" class="btn btn-sm btn-secondary">Ir a la lista</a>
        </div>
      `;
    }
    return;
  }

  try {
    const turno = await obtenerTurnoPorId(turnoId);
    turnoActual = turno;
    renderizarDatosTurno(turno);
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    if (cardContainer) cardContainer.style.display = 'none';

    let errorMsg = error.message;
    if (error.status === 404) {
      errorMsg = `El turno con identificador #${turnoId} no fue encontrado en la base de datos o fue eliminado previamente.`;
    }

    if (errorContainer) {
      errorContainer.innerHTML = renderErrorBanner({
        message: errorMsg,
        retryId: 'btn-retry-detail'
      });

      const retryBtn = document.getElementById('btn-retry-detail');
      if (retryBtn) {
        retryBtn.addEventListener('click', cargarDetalle);
      }
    }
  }
}

function renderizarDatosTurno(turno) {
  const cardContainer = document.getElementById('detail-card-container');
  const idPill = document.getElementById('detail-id-pill');
  const avatarEl = document.getElementById('detail-avatar');
  const nombreEl = document.getElementById('detail-nombre');
  const servicioEl = document.getElementById('detail-servicio');
  const fechaHoraTextoEl = document.getElementById('detail-fecha-hora-texto');
  const btnEditar = document.getElementById('btn-detail-editar');
  const btnEliminar = document.getElementById('btn-detail-eliminar');

  if (cardContainer) cardContainer.style.display = 'block';
  if (idPill) idPill.textContent = formatId(turno.id);
  if (avatarEl) avatarEl.textContent = getInitials(turno.nombre_cliente);
  if (nombreEl) nombreEl.textContent = turno.nombre_cliente;
  if (servicioEl) servicioEl.textContent = turno.servicio;
  if (fechaHoraTextoEl) fechaHoraTextoEl.textContent = formatFechaHora(turno.fecha_hora);

  if (btnEditar) {
    btnEditar.href = `editar-turno.html?id=${encodeURIComponent(turno.id)}`;
  }

  if (btnEliminar) {
    btnEliminar.onclick = () => {
      confirmarEliminacion(turno.id, turno.nombre_cliente, turno.servicio, turno.fecha_hora);
    };
  }
}

function confirmarEliminacion(id, nombre, servicio, fechaHora) {
  const fechaTexto = fechaHora ? ` para el día <strong class="text-main">${escapeHtml(formatFechaHora(fechaHora))}</strong>` : '';
  showConfirmModal({
    title: `¿Borrar el Turno ${formatId(id)}?`,
    message: `¿Estás seguro de que querés borrar el turno de <strong class="text-main">${escapeHtml(nombre)}</strong> para <strong class="text-main">${escapeHtml(servicio)}</strong>${fechaTexto}?<br><br><span class="text-muted" style="font-size: 13px;">Esta acción borrará el turno de la agenda y no se puede recuperar.</span>`,
    confirmText: 'Sí, borrar turno',
    cancelText: 'No, conservar',
    danger: true,
    onConfirm: async () => {
      try {
        const respuesta = await eliminarTurno(id);
        showToast({
          title: '¡Turno Borrado!',
          message: respuesta.mensaje || `El turno ${formatId(id)} fue eliminado de la agenda.`,
          type: 'success'
        });

        // Redirección inmediata a la lista
        setTimeout(() => {
          window.location.href = 'turnos.html';
        }, 700);
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
