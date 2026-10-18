/**
 * COMPONENTES REUTILIZABLES DE INTERFAZ
 * Toasts, Modales de Confirmación, Skeletons y Estados Vacíos
 */

import { escapeHtml } from './utils.js';

// SVG Icons reutilizables
export const ICONS = {
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>`
};

/* ==========================================================================
   SISTEMA DE TOASTS
   ========================================================================== */

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Muestra una notificación toast elegante.
 * @param {object} params
 * @param {string} params.message - Mensaje descriptivo
 * @param {'success'|'error'|'warning'|'info'} [params.type='success']
 * @param {string} [params.title] - Título opcional
 * @param {number} [params.duration=4000] - Tiempo en ms
 */
export function showToast({ message, type = 'success', title = null, duration = 4000 }) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let defaultTitle = 'Aviso';
  let iconSvg = ICONS.info;

  if (type === 'success') {
    defaultTitle = '¡Operación Exitosa!';
    iconSvg = ICONS.checkCircle;
  } else if (type === 'error') {
    defaultTitle = 'Hubo un problema';
    iconSvg = ICONS.alertCircle;
  } else if (type === 'warning') {
    defaultTitle = 'Atención';
    iconSvg = ICONS.alertTriangle;
  }

  const finalTitle = title || defaultTitle;

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(finalTitle)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" type="button" aria-label="Cerrar notificación">${ICONS.x}</button>
    <div class="toast-progress" style="transition: width ${duration}ms linear; width: 100%;"></div>
  `;

  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.add('show');
    const progress = toast.querySelector('.toast-progress');
    if (progress) {
      setTimeout(() => {
        progress.style.width = '0%';
      }, 50);
    }
  });

  const closeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  };

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeToast);
  }

  const timer = setTimeout(closeToast, duration);

  toast.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    const progress = toast.querySelector('.toast-progress');
    if (progress) progress.style.transition = 'none';
  });
}

/* ==========================================================================
   MODAL DE CONFIRMACIÓN
   ========================================================================== */

/**
 * Muestra un modal de confirmación accesible y bloqueante para acciones críticas.
 * @param {object} params
 * @param {string} params.title - Título del modal
 * @param {string} params.message - Mensaje explicativo
 * @param {string} [params.confirmText='Confirmar']
 * @param {string} [params.cancelText='Cancelar']
 * @param {boolean} [params.danger=false] - Estilo destructivo
 * @param {Function} params.onConfirm - Callback al confirmar
 */
export function showConfirmModal({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  onConfirm,
}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    const iconType = danger ? 'danger' : 'info';
    const iconSvg = danger ? ICONS.trash : ICONS.info;
    const confirmBtnClass = danger ? 'btn btn-danger' : 'btn btn-primary';

    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-icon-wrapper ${iconType}">${iconSvg}</div>
          <div class="modal-title-group">
            <h3>${escapeHtml(title)}</h3>
            <p>Confirmación</p>
          </div>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-cancel-btn">${escapeHtml(cancelText)}</button>
          <button type="button" class="${confirmBtnClass} modal-confirm-btn">
            <span class="btn-spinner"></span>
            <span class="btn-text">${escapeHtml(confirmText)}</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
    });

    const confirmBtn = backdrop.querySelector('.modal-confirm-btn');
    const cancelBtn = backdrop.querySelector('.modal-cancel-btn');

    cancelBtn.focus();

    const closeModal = () => {
      backdrop.classList.remove('is-open');
      setTimeout(() => {
        if (backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
      }, 200);
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        resolve(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    cancelBtn.addEventListener('click', () => {
      closeModal();
      resolve(false);
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
        resolve(false);
      }
    });

    confirmBtn.addEventListener('click', async () => {
      if (onConfirm) {
        confirmBtn.classList.add('is-loading');
        cancelBtn.disabled = true;
        try {
          await onConfirm();
          closeModal();
          resolve(true);
        } catch (err) {
          confirmBtn.classList.remove('is-loading');
          cancelBtn.disabled = false;
        }
      } else {
        closeModal();
        resolve(true);
      }
    });
  });
}

/* ==========================================================================
   SKELETON LOADERS
   ========================================================================== */

/**
 * Genera filas de skeleton animadas para tablas.
 * @param {number} rows 
 * @param {number} cols 
 * @returns {string}
 */
export function renderSkeletonTable(rows = 4, cols = 4) {
  let html = '';
  for (let i = 0; i < rows; i++) {
    html += '<tr class="skeleton-card-row">';
    for (let j = 0; j < cols; j++) {
      const widthClass = j === 0 ? 'short' : j === 1 ? 'long' : 'medium';
      html += `
        <td>
          <div class="skeleton skeleton-text ${widthClass}"></div>
        </td>
      `;
    }
    html += '</tr>';
  }
  return html;
}

/* ==========================================================================
   ESTADOS VACÍOS Y ERRORES
   ========================================================================== */

/**
 * Genera el HTML de un estado vacío estilizado.
 */
export function renderEmptyState({
  icon = ICONS.inbox,
  title = 'No hay datos disponibles',
  description = 'No se encontraron turnos para mostrar.',
  actionText = null,
  actionHref = null,
  actionId = null
}) {
  let actionHtml = '';
  if (actionText && actionHref) {
    actionHtml = `<a href="${escapeHtml(actionHref)}" class="btn btn-primary">${ICONS.plus} ${escapeHtml(actionText)}</a>`;
  } else if (actionText && actionId) {
    actionHtml = `<button id="${escapeHtml(actionId)}" class="btn btn-primary">${ICONS.plus} ${escapeHtml(actionText)}</button>`;
  }

  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${escapeHtml(title)}</h3>
      <p class="empty-state-desc">${escapeHtml(description)}</p>
      ${actionHtml}
    </div>
  `;
}

/**
 * Genera el HTML de un banner de error con reintento.
 */
export function renderErrorBanner({ message, retryId = 'btn-retry-error' }) {
  return `
    <div class="alert alert-error">
      ${ICONS.alertCircle}
      <div style="flex: 1;">
        <strong>No pudimos conectar con el sistema</strong>
        <p style="margin-top: 2px;">${escapeHtml(message)}</p>
      </div>
      <button id="${retryId}" class="btn btn-sm btn-secondary" style="color: var(--text-main);">
        ${ICONS.refresh} Volver a intentar
      </button>
    </div>
  `;
}
