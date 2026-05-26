/**
 * Configuración pública del frontend - Formulario CAFSA
 *
 * IMPORTANTE:
 * - No publique en GitHub URLs con tokens, firmas, SAS, claves o secretos.
 * - El endpoint directo de Power Automate del archivo original contiene una firma de invocación.
 * - Para producción, use API Gateway/Lambda o un proxy seguro y coloque aquí solo el endpoint público controlado.
 */
'use strict';

const CONFIG = Object.freeze({
  API_URL: 'https://a2a3y018t4.execute-api.us-east-1.amazonaws.com/dev',
  REQUEST_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['application/pdf'],

  // OCR/autocompletado:
  // En repositorios públicos mantenga este valor vacío. Configure un proxy seguro en AWS.
  OCR_SERVICE_URL: '',
  OCR_TIMEOUT: 60000,
  ENABLE_DIRECT_OCR: false
});

if (typeof window !== 'undefined') window.CONFIG = CONFIG;
if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
