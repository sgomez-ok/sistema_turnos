/**
 * CAPA CENTRAL DE COMUNICACIÓN CON LA API (FastAPI)
 * 
 * Centraliza URL base, peticiones HTTP, manejo de cabeceras,
 * respuestas JSON, códigos HTTP y errores de conexión.
 */

// URL base configurable en un único lugar.
const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

export function getApiBaseUrl() {
  if (localStorage.getItem('API_BASE_URL')) {
    return localStorage.getItem('API_BASE_URL');
  }
  if (window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  // Si se accede a través de un túnel público o el frontend está servido en FastAPI (puerto 8000 o dominio web sin puerto)
  if (window.location.protocol.startsWith('http')) {
    if (window.location.port === '8000' || window.location.port === '' || window.location.port === '80' || window.location.port === '443') {
      return window.location.origin;
    }
    // Si se accede desde la red local (ej. 192.168.x.x:3000)
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:8000`;
    }
  }
  return DEFAULT_API_BASE;
}

export function setApiBaseUrl(newUrl) {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  localStorage.setItem('API_BASE_URL', cleanUrl);
  return cleanUrl;
}

export function resetApiBaseUrl() {
  localStorage.removeItem('API_BASE_URL');
  return DEFAULT_API_BASE;
}

/**
 * Cliente HTTP genérico con gestión robusta de errores y conexión.
 * @param {string} endpoint - Ruta del endpoint (ej. '/turnos')
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (options.body) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Intentamos parsear JSON; si está vacío, retornamos null
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          // Errores de validación de Pydantic (422)
          errorMessage = data.detail.map(d => `${d.loc ? d.loc.join('.') : 'campo'}: ${d.msg}`).join(', ');
        } else {
          errorMessage = data.detail;
        }
      } else if (response.status === 404) {
        errorMessage = 'El recurso solicitado no fue encontrado en el servidor (404).';
      } else if (response.status === 500) {
        errorMessage = 'Error interno del servidor al procesar la operación en la base de datos.';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Si ya es un error con status HTTP, lo relanzamos
    if (err.status) {
      throw err;
    }

    // Error de red, caída del servidor o bloqueo de CORS
    const connectionError = new Error(
      `No se pudo conectar con el backend en ${baseUrl}. Asegurate de que FastAPI esté iniciado con uvicorn y que no haya restricciones de CORS.`
    );
    connectionError.isNetworkError = true;
    connectionError.originalError = err;
    throw connectionError;
  }
}

/**
 * Comprobar el estado del sistema en el backend.
 * GET /estado
 * @returns {Promise<{mensaje: string}>}
 */
export async function comprobarEstado() {
  return await request('/estado', { method: 'GET' });
}

/**
 * Listar todos los turnos registrados.
 * GET /turnos
 * @returns {Promise<Array<{id: number, nombre_cliente: string, servicio: string}>>}
 */
export async function obtenerTurnos() {
  return await request('/turnos', { method: 'GET' });
}

/**
 * Consultar un turno individual por su identificador.
 * GET /turnos/{turno_id}
 * @param {number|string} id
 * @returns {Promise<{id: number, nombre_cliente: string, servicio: string}>}
 */
export async function obtenerTurnoPorId(id) {
  if (!id) {
    throw new Error('Identificador de turno inválido');
  }
  return await request(`/turnos/${encodeURIComponent(id)}`, { method: 'GET' });
}

/**
 * Crear un nuevo turno.
 * POST /turnos
 * @param {{nombre_cliente: string, servicio: string}} datos
 * @returns {Promise<{id: number, mensaje: string}>}
 */
export async function crearTurno(datos) {
  if (!datos || !datos.nombre_cliente || !datos.servicio) {
    throw new Error('El nombre del cliente y el servicio son obligatorios.');
  }

  const payload = {
    nombre_cliente: datos.nombre_cliente.trim(),
    servicio: datos.servicio.trim(),
    fecha_hora: (datos.fecha_hora || '').trim(),
  };

  return await request('/turnos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Actualizar los datos de un turno existente.
 * PUT /turnos/{turno_id}
 * @param {number|string} id
 * @param {{nombre_cliente: string, servicio: string, fecha_hora?: string}} datos
 * @returns {Promise<{mensaje: string}>}
 */
export async function actualizarTurno(id, datos) {
  if (!id) {
    throw new Error('Identificador de turno inválido');
  }
  if (!datos || !datos.nombre_cliente || !datos.servicio) {
    throw new Error('El nombre del cliente y el servicio son obligatorios.');
  }

  const payload = {
    nombre_cliente: datos.nombre_cliente.trim(),
    servicio: datos.servicio.trim(),
    fecha_hora: (datos.fecha_hora || '').trim(),
  };

  return await request(`/turnos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Eliminar un turno existente.
 * DELETE /turnos/{turno_id}
 * @param {number|string} id
 * @returns {Promise<{mensaje: string}>}
 */
export async function eliminarTurno(id) {
  if (!id) {
    throw new Error('Identificador de turno inválido');
  }

  return await request(`/turnos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
