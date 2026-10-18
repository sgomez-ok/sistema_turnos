/**
 * CONTROLADOR PARA CREAR TURNO (crear-turno.html)
 */

import { crearTurno } from './api.js';
import { initNavigation } from './navigation.js';
import { sanitize, escapeHtml, formatFechaHora, enforceFourDigitYear } from './utils.js';
import { showToast, ICONS } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('crear');
  inicializarFormulario();
});

function inicializarFormulario() {
  const form = document.getElementById('form-crear-turno');
  const inputNombre = document.getElementById('input-nombre');
  const inputServicio = document.getElementById('input-servicio');
  const inputFecha = document.getElementById('input-fecha');
  const inputHora = document.getElementById('input-hora');
  const submitBtn = document.getElementById('btn-submit-crear');
  const alertContainer = document.getElementById('form-alert-container');
  const successContainer = document.getElementById('create-success-panel');
  const serviceChips = document.querySelectorAll('.suggestion-chip:not(.date-shortcut):not(.time-shortcut)');
  const dateShortcuts = document.querySelectorAll('.date-shortcut');
  const timeShortcuts = document.querySelectorAll('.time-shortcut');

  // Enforzar año de 4 dígitos estricto en el input de fecha
  if (inputFecha) {
    enforceFourDigitYear(inputFecha);
    
    // Sugerir fecha mínima como hoy
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    inputFecha.min = `${yyyy}-${mm}-${dd}`;
  }

  // Sugerencias rápidas de servicios comunes
  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const valor = chip.getAttribute('data-value');
      if (inputServicio) {
        inputServicio.value = valor;
        validarCampo(inputServicio, 'feedback-servicio', 'El servicio es obligatorio');
        inputServicio.focus();
      }
    });
  });

  // Atajos rápidos de fecha (Hoy, Mañana, Pasado Mañana)
  dateShortcuts.forEach(chip => {
    chip.addEventListener('click', () => {
      const day = chip.getAttribute('data-day');
      const d = new Date();
      if (day === 'manana') {
        d.setDate(d.getDate() + 1);
      } else if (day === 'pasado') {
        d.setDate(d.getDate() + 2);
      }

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      
      if (inputFecha) {
        inputFecha.value = `${y}-${m}-${dayNum}`;
        validarCampo(inputFecha, 'feedback-fecha', 'Seleccioná la fecha del turno');
      }
    });
  });

  // Atajos rápidos de horario (09:00, 11:00, 15:00, etc.)
  timeShortcuts.forEach(chip => {
    chip.addEventListener('click', () => {
      const timeVal = chip.getAttribute('data-time');
      if (timeVal && inputHora) {
        inputHora.value = timeVal;
        validarCampo(inputHora, 'feedback-hora', 'Seleccioná el horario del turno');
      }
    });
  });

  // Validación en tiempo real al tipear
  if (inputNombre) {
    inputNombre.addEventListener('input', () => {
      validarCampo(inputNombre, 'feedback-nombre', 'Ingresá el nombre del cliente (mínimo 2 letras)');
    });
  }

  if (inputServicio) {
    inputServicio.addEventListener('input', () => {
      validarCampo(inputServicio, 'feedback-servicio', 'Ingresá el tipo de servicio (mínimo 2 letras)');
    });
  }

  if (inputFecha) {
    inputFecha.addEventListener('input', () => {
      validarCampo(inputFecha, 'feedback-fecha', 'Seleccioná la fecha del turno');
    });
    inputFecha.addEventListener('change', () => {
      validarCampo(inputFecha, 'feedback-fecha', 'Seleccioná la fecha del turno');
    });
  }

  if (inputHora) {
    inputHora.addEventListener('input', () => {
      validarCampo(inputHora, 'feedback-hora', 'Seleccioná el horario del turno');
    });
    inputHora.addEventListener('change', () => {
      validarCampo(inputHora, 'feedback-hora', 'Seleccioná el horario del turno');
    });
  }

  // Envío del formulario
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (alertContainer) alertContainer.innerHTML = '';

      const nombreValido = validarCampo(inputNombre, 'feedback-nombre', 'Ingresá el nombre del cliente (mínimo 2 letras)');
      const servicioValido = validarCampo(inputServicio, 'feedback-servicio', 'Ingresá el servicio solicitado');
      const fechaValida = validarCampo(inputFecha, 'feedback-fecha', 'Seleccioná la fecha del turno');
      const horaValida = validarCampo(inputHora, 'feedback-hora', 'Seleccioná el horario del turno');

      if (!nombreValido || !servicioValido || !fechaValida || !horaValida) {
        return;
      }

      // Combinamos fecha y hora para el backend: "YYYY-MM-DD HH:mm"
      const fechaHoraCombinada = `${sanitize(inputFecha.value)} ${sanitize(inputHora.value)}`;

      const datos = {
        nombre_cliente: sanitize(inputNombre.value),
        servicio: sanitize(inputServicio.value),
        fecha_hora: fechaHoraCombinada
      };

      // Estado de carga y bloqueo contra envíos duplicados
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      inputNombre.disabled = true;
      inputServicio.disabled = true;
      inputFecha.disabled = true;
      inputHora.disabled = true;

      try {
        const respuesta = await crearTurno(datos);

        showToast({
          title: '¡Turno agendado con éxito!',
          message: respuesta.mensaje || `Guardado como turno #${respuesta.id}`,
          type: 'success'
        });

        // Mostrar panel de éxito claro y amigable
        if (form && successContainer) {
          form.style.display = 'none';
          successContainer.style.display = 'block';

          const createdIdEl = document.getElementById('success-turno-id');
          const createdNombreEl = document.getElementById('success-turno-nombre');
          const createdServicioEl = document.getElementById('success-turno-servicio');
          const createdFechaHoraEl = document.getElementById('success-turno-fecha-hora');
          const btnVerDetalle = document.getElementById('btn-success-ver-detalle');

          if (createdIdEl) createdIdEl.textContent = '#' + String(respuesta.id).padStart(3, '0');
          if (createdNombreEl) createdNombreEl.textContent = datos.nombre_cliente;
          if (createdServicioEl) createdServicioEl.textContent = datos.servicio;
          if (createdFechaHoraEl) createdFechaHoraEl.textContent = formatFechaHora(datos.fecha_hora);
          if (btnVerDetalle) btnVerDetalle.href = `detalle-turno.html?id=${encodeURIComponent(respuesta.id)}`;
        }

      } catch (error) {
        console.error('Error al guardar el turno:', error);

        // Si el horario ya está ocupado (error 400 del backend)
        let alertTitle = 'No pudimos guardar el turno';
        let alertMsg = error.message || 'No hubo respuesta del servidor.';

        if (error.status === 400 || (error.message && error.message.includes('ocupado'))) {
          alertTitle = 'Ese horario ya está ocupado';
          alertMsg = 'Ya existe otro turno reservado para ese mismo día y horario. Por favor elegí otro momento.';
          
          if (inputFecha) inputFecha.classList.add('is-invalid');
          if (inputHora) {
            inputHora.classList.add('is-invalid');
            const feedbackHora = document.getElementById('feedback-hora');
            if (feedbackHora) {
              feedbackHora.innerHTML = `${ICONS.alertTriangle} <span>Horario ya reservado</span>`;
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

      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        inputNombre.disabled = false;
        inputServicio.disabled = false;
        inputFecha.disabled = false;
        inputHora.disabled = false;
      }
    });
  }

  // Botón directo para crear otro turno inmediatamente
  const btnCrearOtro = document.getElementById('btn-crear-otro');
  if (btnCrearOtro) {
    btnCrearOtro.addEventListener('click', () => {
      if (form && successContainer) {
        form.reset();
        
        // Limpiar feedbacks y estados de error
        const invalidInputs = form.querySelectorAll('.is-invalid');
        invalidInputs.forEach(el => el.classList.remove('is-invalid'));
        const feedbacks = form.querySelectorAll('.form-feedback');
        feedbacks.forEach(el => el.innerHTML = '');
        if (alertContainer) alertContainer.innerHTML = '';

        form.style.display = 'block';
        successContainer.style.display = 'none';
        if (inputNombre) inputNombre.focus();
      }
    });
  }
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
