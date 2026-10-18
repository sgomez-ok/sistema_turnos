/**
 * CONTROLADOR DE ESTADO DEL SISTEMA (configuracion.html)
 */

import { comprobarEstado, getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from './api.js';
import { initNavigation } from './navigation.js';
import { showToast, ICONS } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation('configuracion');
  inicializarConfiguracion();
});

function inicializarConfiguracion() {
  const inputBaseUrl = document.getElementById('input-api-url');
  const btnGuardarUrl = document.getElementById('btn-guardar-url');
  const btnRestablecerUrl = document.getElementById('btn-restablecer-url');
  const btnProbarPing = document.getElementById('btn-probar-ping');

  // Mostrar URL actual
  if (inputBaseUrl) {
    inputBaseUrl.value = getApiBaseUrl();
  }

  // Guardar nueva URL base
  if (btnGuardarUrl && inputBaseUrl) {
    btnGuardarUrl.addEventListener('click', () => {
      const nuevaUrl = inputBaseUrl.value.trim();
      if (!nuevaUrl) {
        showToast({
          title: 'Dirección requerida',
          message: 'Ingresá una dirección válida para conectar con el servidor.',
          type: 'warning'
        });
        return;
      }

      setApiBaseUrl(nuevaUrl);
      showToast({
        title: '¡Dirección Guardada!',
        message: `Ahora el sistema se conectará a: ${nuevaUrl}`,
        type: 'success'
      });
      ejecutarDiagnosticoPing();
    });
  }

  // Restablecer URL por defecto
  if (btnRestablecerUrl && inputBaseUrl) {
    btnRestablecerUrl.addEventListener('click', () => {
      const defaultUrl = resetApiBaseUrl();
      inputBaseUrl.value = defaultUrl;
      showToast({
        title: 'Dirección Restablecida',
        message: `Se volvió a configurar la dirección original: ${defaultUrl}`,
        type: 'info'
      });
      ejecutarDiagnosticoPing();
    });
  }

  // Probar conexión interactiva
  if (btnProbarPing) {
    btnProbarPing.addEventListener('click', () => {
      ejecutarDiagnosticoPing();
    });
  }

  // Diagnóstico automático al entrar a la página
  ejecutarDiagnosticoPing();
}

async function ejecutarDiagnosticoPing() {
  const pingStatusPill = document.getElementById('diag-ping-pill');
  const pingMensaje = document.getElementById('diag-ping-mensaje');
  const pingLatencia = document.getElementById('diag-ping-latencia');
  const pingUrl = document.getElementById('diag-ping-url');
  const btnProbarPing = document.getElementById('btn-probar-ping');

  if (btnProbarPing) btnProbarPing.classList.add('is-loading');

  const inicio = performance.now();
  const urlActual = getApiBaseUrl();

  if (pingUrl) pingUrl.textContent = `${urlActual}/estado`;
  if (pingStatusPill) pingStatusPill.innerHTML = `<span class="badge badge-warning">Comprobando...</span>`;

  try {
    const data = await comprobarEstado();
    const latencia = Math.round(performance.now() - inicio);

    if (pingStatusPill) {
      pingStatusPill.innerHTML = `<span class="badge badge-success">Conectado y Funcionando</span>`;
    }
    if (pingMensaje) {
      pingMensaje.textContent = data.mensaje || 'Sistema de turnos activo';
    }
    if (pingLatencia) {
      pingLatencia.textContent = `${latencia} ms (Respuesta ultrarrápida)`;
    }
  } catch (error) {
    const latencia = Math.round(performance.now() - inicio);

    if (pingStatusPill) {
      pingStatusPill.innerHTML = `<span class="badge badge-error">Sin conexión</span>`;
    }
    if (pingMensaje) {
      pingMensaje.textContent = error.message || 'No se pudo comunicar con el servidor.';
    }
    if (pingLatencia) {
      pingLatencia.textContent = `${latencia} ms`;
    }
  } finally {
    if (btnProbarPing) btnProbarPing.classList.remove('is-loading');
  }
}
