/**
 * Ejemplo de configuración privada para pruebas controladas.
 * No subir este archivo con URLs firmadas o tokens a un repositorio público.
 */
'use strict';

const CONFIG = Object.freeze({
  API_URL: 'https://API_ID.execute-api.REGION.amazonaws.com/dev',
  REQUEST_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['application/pdf'],
  OCR_SERVICE_URL: 'PEGAR_AQUI_ENDPOINT_OCR_PRIVADO_O_PROXY_AWS',
  OCR_TIMEOUT: 60000,
  ENABLE_DIRECT_OCR: true
});

if (typeof window !== 'undefined') window.CONFIG = CONFIG;
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
