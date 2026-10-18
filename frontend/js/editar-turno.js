/**
 * CONTROLADOR PARA MODIFICAR TURNO (editar-turno.html)
 */

import { obtenerTurnoPorId, actualizarTurno } from './api.js';
import { initNavigation } from './navigation.js';
import { getUrlParam, sanitize, escapeHtml, formatId, splitFechaHora, enforceFourDigitYear } from './utils.js';
import { showToast, renderErrorBanner, ICONS } from './components.js';

let turnoId = null;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('turnos');
  turnoId = getUrlParam('id');
  inicializarEdicion();
});

async function inicializarEdicion() {
  const form = document.getElementById('form-editar-turno');
  const inputNombre = document.getElementById('input-edit-nombre');
  const inputServicio = document.getElementById('input-edit-servicio');
  const inputFecha = document.getElementById('input-edit-fecha');
  const inputHora = document.getElementById('input-edit-hora');
  const submitBtn = document.getElementById('btn-submit-editar');
  const alertContainer = document.getElementById('edit-alert-container');
  const cardTitle = document.getElementById('edit-card-title');
  const cardIdBadge = document.getElementById('edit-id-badge');
  const btnVolverDetalle = document.getElementById('btn-volver-detalle');

  if (!turnoId) {
    if (form) form.style.display = 'none';
    if (alertContainer) {
      alertContainer.innerHTML = `
        <div class="alert alert-warning">
          ${ICONS.alertTriangle}
          <div style="flex: 1;">
            <strong>Falta el número de turno</strong>
            <p>No se indicó qué turno modificar.</p>
          </div>
          <a href="turnos.html" class="btn btn-sm btn-secondary">Volver a los turnos</a>
        </div>
      `;
    }
    return;
  }

  if (cardIdBadge) cardIdBadge.textContent = formatId(turnoId);
  if (btnVolverDetalle) btnVolverDetalle.href = `detalle-turno.html?id=${encodeURIComponent(turnoId)}`;

  // Enforzar año de 4 dígitos estricto
  if (inputFecha) {
    enforceFourDigitYear(inputFecha);
  }

  // 1. Cargar datos actuales desde el servidor
  submitBtn.disabled = true;
  inputNombre.disabled = true;
  inputServicio.disabled = true;
  if (inputFecha) inputFecha.disabled = true;
  if (inputHora) inputHora.disabled = true;

  try {
    const turno = await obtenerTurnoPorId(turnoId);
    inputNombre.value = turno.nombre_cliente || '';
    inputServicio.value = turno.servicio || '';

    // Descomponer fecha y hora
    if (turno.fecha_hora) {
      const { fecha, hora } = splitFechaHora(turno.fecha_hora);
      if (inputFecha) inputFecha.value = fecha || '';
      if (inputHora) inputHora.value = hora || '';
    }

    if (cardTitle) {
      cardTitle.textContent = `Modificar Turno ${formatId(turno.id)}`;
    }

    submitBtn.disabled = false;
    inputNombre.disabled = false;
    inputServicio.disabled = false;
    if (inputFecha) inputFecha.disabled = false;
    if (inputHora) inputHora.disabled = false;
    inputNombre.focus();
  } catch (error) {
    console.error('Error al recuperar turno:', error);
    if (form) form.style.display = 'none';

    let errorMsg = error.message;
    if (error.status === 404) {
      errorMsg = `El turno ${formatId(turnoId)} ya no existe o fue eliminado anteriormente.`;
    }

    if (alertContainer) {
      alertContainer.innerHTML = renderErrorBanner({
        message: errorMsg,
        retryId: 'btn-retry-load-edit'
      });

      const retryBtn = document.getElementById('btn-retry-load-edit');
      if (retryBtn) {
        retryBtn.addEventListener('click', inicializarEdicion);
      }
    }
    return;
  }

  // 2. Validación en tiempo real
  if (inputNombre) {
    inputNombre.addEventListener('input', () => {
      validarCampo(inputNombre, 'feedback-edit-nombre', 'Ingresá el nombre del cliente');
    });
  }

  if (inputServicio) {
    inputServicio.addEventListener('input', () => {
      validarCampo(inputServicio, 'feedback-edit-servicio', 'Ingresá el servicio solicitado');
    });
  }

  if (inputFecha) {
    inputFecha.addEventListener('input', () => {
      validarCampo(inputFecha, 'feedback-edit-fecha', 'Seleccioná la fecha del turno');
    });
    inputFecha.addEventListener('change', () => {
      validarCampo(inputFecha, 'feedback-edit-fecha', 'Seleccioná la fecha del turno');
    });
  }

  if (inputHora) {
    inputHora.addEventListener('input', () => {
      validarCampo(inputHora, 'feedback-edit-hora', 'Seleccioná el horario del turno');
    });
    inputHora.addEventListener('change', () => {
      validarCampo(inputHora, 'feedback-edit-hora', 'Seleccioná el horario del turno');
    });
  }

  // 3. Envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (alertContainer) alertContainer.innerHTML = '';

    const nombreValido = validarCampo(inputNombre, 'feedback-edit-nombre', 'Ingresá el nombre del cliente');
    const servicioValido = validarCampo(inputServicio, 'feedback-edit-servicio', 'Ingresá el servicio');
    const fechaValida = validarCampo(inputFecha, 'feedback-edit-fecha', 'Seleccioná la fecha');
    const horaValida = validarCampo(inputHora, 'feedback-edit-hora', 'Seleccioná el horario');

    if (!nombreValido || !servicioValido || !fechaValida || !horaValida) return;

    // Combinar fecha y hora
    const fechaHoraCombinada = `${sanitize(inputFecha.value)} ${sanitize(inputHora.value)}`;

    const datos = {
      nombre_cliente: sanitize(inputNombre.value),
      servicio: sanitize(inputServicio.value),
      fecha_hora: fechaHoraCombinada
    };

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    inputNombre.disabled = true;
    inputServicio.disabled = true;
    if (inputFecha) inputFecha.disabled = true;
    if (inputHora) inputHora.disabled = true;

    try {
      const respuesta = await actualizarTurno(turnoId, datos);

      showToast({
        title: '¡Cambios Guardados!',
        message: respuesta.mensaje || `El turno ${formatId(turnoId)} se actualizó con éxito.`,
        type: 'success'
      });

      // Volver a la ficha del turno
      setTimeout(() => {
        window.location.href = `detalle-turno.html?id=${encodeURIComponent(turnoId)}`;
      }, 700);

    } catch (error) {
      console.error('Error al actualizar el turno:', error);

      let alertTitle = 'No pudimos guardar los cambios';
      let alertMsg = error.message || 'Error de conexión con el servidor.';

      // Horario ocupado por otro turno (400)
      if (error.status === 400 || (error.message && error.message.includes('ocupado'))) {
        alertTitle = 'Ese horario ya está ocupado';
        alertMsg = 'Ya existe otro turno reservado para esa misma fecha y hora. Elegí otro momento.';
        if (inputFecha) inputFecha.classList.add('is-invalid');
        if (inputHora) {
          inputHora.classList.add('is-invalid');
          const feedbackEl = document.getElementById('feedback-edit-hora');
          if (feedbackEl) {
            feedbackEl.innerHTML = `${ICONS.alertTriangle} <span>Horario ya reservado</span>`;
          }
        }
      }

      if (alertContainer) {
        alertContainer.innerHTML = `
          <div class="alert alert-error">
            ${ICONS.alertCircle}
            <div>
              <strong>${escapeHtml(alertTitle)}</strong>
              <p style="margin-top: 2px;">${escapeHtml(alertMsg)}</p>
            </div>
          </div>
        `;
      }

      showToast({
        title: alertTitle,
        message: alertMsg,
        type: error.status === 400 ? 'warning' : 'error'
      });

      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      inputNombre.disabled = false;
      inputServicio.disabled = false;
      if (inputFecha) inputFecha.disabled = false;
      if (inputHora) inputHora.disabled = false;
    }
  });
}

/**
 * Valida un campo de entrada y muestra el mensaje de error correspondiente.
 */
function validarCampo(inputEl, feedbackId, errorMsg) {
  if (!inputEl) return false;
  const valor = sanitize(inputEl.value);
  const feedbackEl = document.getElementById(feedbackId);

  if (!valor || valor.length < 1) {
    inputEl.classList.add('is-invalid');
    if (feedbackEl) {
      feedbackEl.innerHTML = `${ICONS.alertCircle} <span>${errorMsg}</span>`;
    }
    return false;
  } else {
    inputEl.classList.remove('is-invalid');
    if (feedbackEl) {
      feedbackEl.innerHTML = '';
    }
    return true;
  }
}
