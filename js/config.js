/*
 * Configuración pública del frontend.
 * No colocar secretos, llaves privadas, tokens ni credenciales en este archivo.
 * Para producción, configurar API_ENDPOINT con el endpoint HTTPS del API Gateway/Lambda,
 * ALB o servicio backend autorizado por CAFSA.
 */
window.CAFSA_FORM_CONFIG = Object.freeze({
  API_ENDPOINT: '',
  MAX_FILE_MB: 10,
  DEMO_MODE: true
});
