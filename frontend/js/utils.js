/**
 * UTILIDADES GENERALES
 */

/**
 * Escapa caracteres HTML especiales para prevenir XSS.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Limpia espacios innecesarios al inicio, fin y entre palabras.
 * @param {string} str 
 * @returns {string}
 */
export function sanitize(str) {
  if (!str) return '';
  return String(str).trim();
}

/**
 * Obtiene el valor de un parámetro de la query string (URL).
 * @param {string} param 
 * @returns {string|null}
 */
export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Debounce para búsquedas instantáneas y eventos de entrada.
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formatea un identificador numérico con ceros a la izquierda (ej. #001).
 * @param {number|string} id 
 * @returns {string}
 */
export function formatId(id) {
  if (id === null || id === undefined) return '#000';
  return '#' + String(id).padStart(3, '0');
}

/**
 * Obtiene las iniciales de un nombre (ej. "Juan Pérez" -> "JP").
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  const parts = sanitize(name).split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formatea una fecha y hora para visualización amigable y profesional.
 * Si es formato ISO (YYYY-MM-DDTHH:mm o YYYY-MM-DD HH:mm), formatea como DD/MM/YYYY a las HH:mm hs.
 * Si es texto libre (ej. "10/11" o "15/10/2026"), lo devuelve limpio.
 * @param {string} fechaHoraStr 
 * @returns {string}
 */
export function formatFechaHora(fechaHoraStr) {
  if (!fechaHoraStr) return 'Sin fecha';
  const clean = sanitize(fechaHoraStr);
  
  // Coincide con YYYY-MM-DDTHH:mm o YYYY-MM-DD HH:mm
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
  if (isoMatch) {
    const [_, year, month, day, hours, minutes] = isoMatch;
    return `${day}/${month}/${year} a las ${hours}:${minutes} hs`;
  }

  // Coincide solo con fecha YYYY-MM-DD
  const dateMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const [_, year, month, day] = dateMatch;
    return `${day}/${month}/${year}`;
  }

  return clean;
}

/**
 * Descompone un string de fecha_hora en dos valores: fecha (YYYY-MM-DD) y hora (HH:mm).
 * @param {string} str 
 * @returns {{fecha: string, hora: string}}
 */
export function splitFechaHora(str) {
  if (!str) return { fecha: '', hora: '' };
  const clean = sanitize(str);

  // YYYY-MM-DDTHH:mm o YYYY-MM-DD HH:mm
  const match = clean.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
  if (match) {
    return { fecha: match[1], hora: match[2] };
  }

  // DD/MM/YYYY HH:mm
  const matchDmy = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})[T\s](\d{2}:\d{2})/);
  if (matchDmy) {
    return { fecha: `${matchDmy[3]}-${matchDmy[2]}-${matchDmy[1]}`, hora: matchDmy[4] };
  }

  // Solo fecha YYYY-MM-DD
  if (clean.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return { fecha: clean, hora: '' };
  }

  return { fecha: clean, hora: '' };
}

/**
 * Controla que al escribir un año manualmente en un input type="date", corte exactamente en 4 dígitos.
 * @param {HTMLInputElement} dateInput 
 */
export function enforceFourDigitYear(dateInput) {
  if (!dateInput) return;

  const sanitizeYear = () => {
    const val = dateInput.value;
    if (!val) return;
    const parts = val.split('-');
    if (parts[0] && parts[0].length > 4) {
      parts[0] = parts[0].slice(0, 4);
      dateInput.value = parts.join('-');
    }
  };

  dateInput.addEventListener('keydown', (e) => {
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
      return;
    }
    if (e.key >= '0' && e.key <= '9') {
      setTimeout(sanitizeYear, 0);
    }
  });

  dateInput.addEventListener('input', sanitizeYear);
  dateInput.addEventListener('change', sanitizeYear);
  dateInput.addEventListener('blur', sanitizeYear);
}

