/**
 * Aplicación principal del Formulario de Solicitudes CAFSA
 * Flujo: Carga PDF → OCR/autocompletado → datos adicionales → envío.
 */
'use strict';

// ============================================================
// Config helper
// ============================================================
function getAppConfig() {
  const cfg = (typeof window !== 'undefined' && window.CONFIG)
    || (typeof globalThis !== 'undefined' && globalThis.CONFIG)
    || (typeof CONFIG !== 'undefined' ? CONFIG : {})
    || {};

  return {
    API_URL: cfg.API_URL || '',
    REQUEST_TIMEOUT: cfg.REQUEST_TIMEOUT || 30000,
    MAX_FILE_SIZE: cfg.MAX_FILE_SIZE || 10 * 1024 * 1024,
    ALLOWED_FILE_TYPES: cfg.ALLOWED_FILE_TYPES || ['application/pdf'],
    OCR_SERVICE_URL: cfg.OCR_SERVICE_URL || '',
    OCR_TIMEOUT: cfg.OCR_TIMEOUT || 60000,
    ENABLE_DIRECT_OCR: cfg.ENABLE_DIRECT_OCR === true
  };
}

// ============================================================
// Validation Rules
// ============================================================
const VALIDATION_RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Ingrese un email válido'
  },
  nombre: {
    minLength: 2,
    maxLength: 50,
    regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
    errorMessage: 'El nombre debe tener entre 2 y 50 caracteres'
  },
  primerApellido: {
    minLength: 2,
    maxLength: 50,
    regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
    errorMessage: 'El primer apellido debe tener entre 2 y 50 caracteres'
  },
  segundoApellido: {
    minLength: 2,
    maxLength: 50,
    regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/,
    errorMessage: 'El segundo apellido debe tener entre 2 y 50 caracteres'
  },
  numeroIdentificacion: {
    patterns: [
      /^\d{1}-\d{4}-\d{4}$/,
      /^\d{1}-\d{4}-\d{4}-\d{4}$/,
      /^PA-[A-Z0-9]{4,20}$/i
    ],
    errorMessage: 'Ingrese un número de identificación válido de Costa Rica'
  },
  numeroTelefono: {
    regex: /^\d{8}$/,
    errorMessage: 'Ingrese 8 dígitos sin guiones ni espacios'
  },
  provincia: { errorMessage: 'Seleccione una provincia' },
  canton: { errorMessage: 'Seleccione un cantón' },
  distrito: { errorMessage: 'Seleccione un distrito' },
  direccionExacta: {
    minLength: 10,
    maxLength: 200,
    regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,.;:\-#°/()]+$/,
    errorMessage: 'La dirección debe tener entre 10 y 200 caracteres, sin caracteres especiales no permitidos'
  },
  fechaVencimientoDocumento: {
    errorMessage: 'Seleccione una fecha de vencimiento válida'
  },
  consentimiento: {
    errorMessage: 'Debe aceptar el consentimiento para continuar'
  }
};

const VALIDATED_FIELDS = [
  'numeroIdentificacion', 'nombre', 'primerApellido', 'segundoApellido',
  'fechaVencimientoDocumento', 'email', 'numeroTelefono',
  'provincia', 'canton', 'distrito', 'direccionExacta', 'consentimiento'
];

let fileIsValid = false;
let lastSelectedFile = null;

// ============================================================
// DOM helpers
// ============================================================
function byId(id) {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

function showError(fieldId, message) {
  const errorSpan = byId(fieldId + '-error');
  if (errorSpan) errorSpan.textContent = message || '';

  const field = byId(fieldId);
  if (field) {
    field.classList.toggle('invalid', Boolean(message));
    field.classList.toggle('valid', !message && getFieldValue(fieldId) !== '');
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}

function showSubmitError(message) {
  const el = byId('submitError');
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function getFieldValue(fieldId) {
  const field = byId(fieldId);
  if (!field) return '';
  if (field.type === 'checkbox') return field.checked;
  return (field.value || '').trim();
}

function setFieldValue(fieldId, value) {
  const el = byId(fieldId);
  if (!el || value === undefined || value === null || value === '') return;
  el.value = String(value).trim();
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// ============================================================
// Field validation
// ============================================================
function validateField(fieldId, value) {
  const rule = VALIDATION_RULES[fieldId];
  if (!rule) return '';

  switch (fieldId) {
    case 'email':
      return rule.regex.test(String(value)) ? '' : rule.errorMessage;

    case 'nombre':
    case 'primerApellido':
    case 'segundoApellido': {
      const text = String(value || '').trim();
      if (text.length < rule.minLength || text.length > rule.maxLength) return rule.errorMessage;
      return rule.regex.test(text) ? '' : rule.errorMessage;
    }

    case 'numeroIdentificacion':
      return rule.patterns.some(p => p.test(String(value || '').trim())) ? '' : rule.errorMessage;

    case 'numeroTelefono':
      return rule.regex.test(String(value || '').trim()) ? '' : rule.errorMessage;

    case 'provincia':
    case 'canton':
    case 'distrito':
      return value !== '' ? '' : rule.errorMessage;

    case 'direccionExacta': {
      const text = String(value || '').trim();
      if (text.length < rule.minLength || text.length > rule.maxLength) return rule.errorMessage;
      return rule.regex.test(text) ? '' : rule.errorMessage;
    }

    case 'fechaVencimientoDocumento': {
      if (!value) return rule.errorMessage;
      const date = new Date(String(value));
      if (Number.isNaN(date.getTime())) return rule.errorMessage;
      return '';
    }

    case 'consentimiento':
      return value ? '' : rule.errorMessage;

    default:
      return '';
  }
}

function validateForm() {
  let isValid = true;

  for (const fieldId of VALIDATED_FIELDS) {
    const error = validateField(fieldId, getFieldValue(fieldId));
    showError(fieldId, error);
    if (error) isValid = false;
  }

  if (!fileIsValid) {
    isValid = false;
    const err = byId('documentoIdentificacion-error');
    if (err && !err.textContent) err.textContent = 'Debe adjuntar un PDF válido';
  }

  updateSubmitButton(isValid);
  return isValid;
}

function checkFormValidity() {
  for (const fieldId of VALIDATED_FIELDS) {
    if (validateField(fieldId, getFieldValue(fieldId))) return false;
  }
  return fileIsValid;
}

function updateSubmitButton(isValid) {
  const btn = byId('submitBtn');
  if (btn) btn.disabled = !isValid;
}

// ============================================================
// File validation and upload UX
// ============================================================
function validateFile(file) {
  const fileNameDisplay = byId('file-name-display');
  const errorSpan = byId('documentoIdentificacion-error');
  const uploadArea = byId('fileUploadArea');

  if (fileNameDisplay) fileNameDisplay.textContent = '';
  if (errorSpan) errorSpan.textContent = '';
  if (uploadArea) uploadArea.classList.remove('has-file');

  if (!file) {
    fileIsValid = false;
    lastSelectedFile = null;
    updateSubmitButton(false);
    return '';
  }

  if (fileNameDisplay) fileNameDisplay.textContent = file.name;

  const cfg = getAppConfig();
  const extension = (file.name || '').toLowerCase().split('.').pop();
  const mimeIsAcceptable = !file.type || cfg.ALLOWED_FILE_TYPES.includes(file.type);

  if (extension !== 'pdf' || !mimeIsAcceptable) {
    const msg = 'Solo se permiten archivos PDF';
    if (errorSpan) errorSpan.textContent = msg;
    fileIsValid = false;
    lastSelectedFile = null;
    updateSubmitButton(false);
    return msg;
  }

  if (file.size > cfg.MAX_FILE_SIZE) {
    const msg = 'El archivo no puede exceder 10 MB';
    if (errorSpan) errorSpan.textContent = msg;
    fileIsValid = false;
    lastSelectedFile = null;
    updateSubmitButton(false);
    return msg;
  }

  fileIsValid = true;
  lastSelectedFile = file;
  if (uploadArea) uploadArea.classList.add('has-file');
  updateSubmitButton(checkFormValidity());
  return '';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// OCR extraction
// ============================================================
async function extractCedulaData(file) {
  const ocrStatus = byId('ocr-status');
  const ocrError = byId('ocr-error');
  const ocrErrorMsg = byId('ocr-error-message');
  const cfg = getAppConfig();

  if (ocrError) ocrError.hidden = true;
  if (ocrStatus) ocrStatus.hidden = false;

  try {
    if (!cfg.OCR_SERVICE_URL) {
      throw new Error('OCR_SERVICE_URL no configurado');
    }

    if (!cfg.ENABLE_DIRECT_OCR) {
      throw new Error('OCR directo deshabilitado por seguridad');
    }

    const fileContent = await fileToBase64(file);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), cfg.OCR_TIMEOUT);

    const response = await fetch(cfg.OCR_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileContent }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Servicio OCR respondió: ' + response.status);
    }

    const rawData = await response.json();
    const data = normalizeOcrData(rawData);

    if (!hasAnyOcrData(data)) {
      throw new Error('OCR sin datos mapeables');
    }

    applyOcrData(data);
    showFormSection();
    highlightAutoFilledFields();
    updateSubmitButton(checkFormValidity());
  } catch (error) {
    if (ocrError && ocrErrorMsg) {
      ocrErrorMsg.textContent = buildOcrErrorMessage(error);
      ocrError.hidden = false;
    }
    console.warn('OCR/autocompletado no disponible:', error.message);
  } finally {
    if (ocrStatus) ocrStatus.hidden = true;
  }
}

function buildOcrErrorMessage(error) {
  if (error && error.name === 'AbortError') return 'El servicio de extracción tardó demasiado en responder.';
  if (error && /no configurado/i.test(error.message)) {
    return 'El archivo fue cargado correctamente, pero el autocompletado requiere configurar el servicio OCR.';
  }
  if (error && /deshabilitado/i.test(error.message)) {
    return 'El archivo fue cargado correctamente. Por seguridad, el OCR directo está deshabilitado en la configuración pública.';
  }
  return 'No se pudieron extraer los datos automáticamente. Puede continuar con el llenado manual.';
}

function normalizeOcrData(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const source = Array.isArray(data.documents) && data.documents[0] ? data.documents[0] : data;

  return {
    numeroIdentificacion: pick(source, [
      'numeroIdentificacion', 'numero_cedula', 'numeroCedula', 'cedula', 'identificacion',
      'documentNumber', 'idNumber', 'numero_documento', 'NUMERO_CEDULA'
    ]),
    nombre: pick(source, ['nombre', 'firstName', 'givenName', 'nombres', 'NOMBRE']),
    primerApellido: pick(source, ['primerApellido', 'primer_apellido', 'apellido1', 'firstSurname', 'PRIMER_APELLIDO']),
    segundoApellido: pick(source, ['segundoApellido', 'segundo_apellido', 'apellido2', 'secondSurname', 'SEGUNDO_APELLIDO']),
    fechaVencimientoDocumento: pick(source, [
      'fechaVencimientoDocumento', 'fecha_vencimiento', 'fechaVencimiento', 'expirationDate',
      'dateOfExpiration', 'FECHA_VENCIMIENTO'
    ])
  };
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') return obj[key];
  }
  return '';
}

function hasAnyOcrData(data) {
  return Object.values(data || {}).some(value => String(value || '').trim() !== '');
}

function applyOcrData(data) {
  if (data.numeroIdentificacion) setFieldValue('numeroIdentificacion', formatCedula(String(data.numeroIdentificacion)));
  if (data.nombre) setFieldValue('nombre', String(data.nombre).toUpperCase());
  if (data.primerApellido) setFieldValue('primerApellido', String(data.primerApellido).toUpperCase());
  if (data.segundoApellido) setFieldValue('segundoApellido', String(data.segundoApellido).toUpperCase());
  if (data.fechaVencimientoDocumento) {
    setFieldValue('fechaVencimientoDocumento', formatFechaVencimiento(String(data.fechaVencimientoDocumento)));
  }
}

function highlightAutoFilledFields() {
  ['numeroIdentificacion', 'nombre', 'primerApellido', 'segundoApellido', 'fechaVencimientoDocumento'].forEach(id => {
    const el = byId(id);
    if (el && el.value) {
      el.classList.add('autofilled');
      setTimeout(() => el.classList.remove('autofilled'), 3000);
    }
  });
}

function formatCedula(raw) {
  const value = String(raw || '').trim();
  if (/^PA-/i.test(value)) return value.toUpperCase();
  if (/^\d{1}-\d{4}-\d{4}(-\d{4})?$/.test(value)) return value;

  const digits = value.replace(/\D/g, '');
  if (digits.length === 9) return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 9)}`;
  if (digits.length === 13) return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 13)}`;
  return value;
}

function formatFechaVencimiento(raw) {
  const value = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const cleaned = value.replace(/\//g, '-').replace(/\s+/g, ' ');
  const parts = cleaned.split('-');
  if (parts.length === 3) {
    let [a, b, c] = parts.map(x => x.trim());
    // DD-MM-YYYY
    if (c.length === 4) {
      const result = `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
      if (!Number.isNaN(new Date(result).getTime())) return result;
    }
    // YYYY-MM-DD
    if (a.length === 4) {
      const result = `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
      if (!Number.isNaN(new Date(result).getTime())) return result;
    }
  }

  const months = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };
  const match = value.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+del?\s+(\d{4})$/i);
  if (match && months[match[2]]) {
    return `${match[3]}-${months[match[2]]}-${match[1].padStart(2, '0')}`;
  }

  return value;
}

// ============================================================
// Visibility
// ============================================================
function showFormSection() {
  const form = byId('solicitudForm');
  if (form) {
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================
// Submit
// ============================================================
async function submitForm() {
  const submitBtn = byId('submitBtn');
  const loadingIndicator = byId('loadingIndicator');
  const submitError = byId('submitError');
  const form = byId('solicitudForm');
  const step1 = byId('step1-upload');
  const confirmacion = byId('confirmacion');
  const requestIdDisplay = byId('requestIdDisplay');
  const cfg = getAppConfig();

  if (submitError) {
    submitError.textContent = '';
    submitError.hidden = true;
  }
  if (loadingIndicator) loadingIndicator.hidden = false;
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (!cfg.API_URL) {
      throw new Error('API_URL no configurado');
    }

    const formData = new FormData();
    for (const fieldId of VALIDATED_FIELDS) {
      if (fieldId === 'consentimiento') {
        formData.append(fieldId, getFieldValue(fieldId) ? 'true' : 'false');
      } else {
        formData.append(fieldId, getFieldValue(fieldId));
      }
    }
    formData.append('pais', getFieldValue('pais') || 'CR');

    const fileInput = byId('documentoIdentificacion');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('documentoIdentificacion', fileInput.files[0]);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), cfg.REQUEST_TIMEOUT);

    const response = await fetch(cfg.API_URL.replace(/\/$/, '') + '/submit', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 200 || response.status === 202) {
      const data = await response.json();
      if (form) form.hidden = true;
      if (step1) step1.hidden = true;
      if (confirmacion) confirmacion.hidden = false;
      if (requestIdDisplay) requestIdDisplay.textContent = data.cedula || data.requestId || data.id || '';
      return;
    }

    showSubmitError(getSubmitErrorMessage(response.status));
  } catch (error) {
    if (error && /API_URL no configurado/i.test(error.message)) {
      showSubmitError('Endpoint de envío no configurado. Configure API_URL antes de enviar a producción.');
    } else if (error && error.name === 'AbortError') {
      showSubmitError('La solicitud tardó demasiado en responder. Intente nuevamente.');
    } else {
      showSubmitError('Error de conexión. Verifique su conexión a internet.');
    }
  } finally {
    if (loadingIndicator) loadingIndicator.hidden = true;
    if (submitBtn) submitBtn.disabled = !checkFormValidity();
  }
}

function getSubmitErrorMessage(status) {
  switch (status) {
    case 400: return 'Datos del formulario inválidos. Revise los campos.';
    case 401:
    case 403: return 'No autorizado para enviar la solicitud.';
    case 413: return 'El archivo es demasiado grande. Máximo 10 MB.';
    case 415: return 'Tipo de archivo no permitido. Solo se acepta PDF.';
    case 429: return 'Demasiadas solicitudes. Intente de nuevo en unos minutos.';
    default: return 'Error del servidor. Intente más tarde.';
  }
}

// ============================================================
// Initialization
// ============================================================
function initApp() {
  const fileInput = byId('documentoIdentificacion');
  const uploadArea = byId('fileUploadArea');

  if (uploadArea && fileInput) {
    // Si el área es label[for], el navegador abre el selector nativamente.
    if (uploadArea.tagName.toLowerCase() !== 'label') {
      uploadArea.addEventListener('click', () => fileInput.click());
    }

    uploadArea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    uploadArea.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function () {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : [];
      if (files.length > 0) {
        if (typeof DataTransfer !== 'undefined') {
          const dt = new DataTransfer();
          dt.items.add(files[0]);
          fileInput.files = dt.files;
        }
        handleFileSelected(files[0]);
      }
    });

    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      handleFileSelected(file);
    });
  }

  const btnManual = byId('btnManualFill');
  if (btnManual) btnManual.addEventListener('click', showFormSection);

  const blurFields = ['email', 'nombre', 'primerApellido', 'segundoApellido', 'numeroIdentificacion', 'numeroTelefono', 'direccionExacta'];
  for (const fieldId of blurFields) {
    const field = byId(fieldId);
    if (!field) continue;

    field.addEventListener('blur', function () {
      showError(fieldId, validateField(fieldId, getFieldValue(fieldId)));
      updateSubmitButton(checkFormValidity());
    });

    field.addEventListener('input', function () {
      const errorSpan = byId(fieldId + '-error');
      if (errorSpan && errorSpan.textContent !== '') {
        showError(fieldId, validateField(fieldId, getFieldValue(fieldId)));
      }
      updateSubmitButton(checkFormValidity());
    });
  }

  ['provincia', 'canton', 'distrito', 'fechaVencimientoDocumento'].forEach(fieldId => {
    const field = byId(fieldId);
    if (!field) return;
    field.addEventListener('change', function () {
      showError(fieldId, validateField(fieldId, getFieldValue(fieldId)));
      updateSubmitButton(checkFormValidity());
    });
  });

  const consent = byId('consentimiento');
  if (consent) {
    consent.addEventListener('change', function () {
      showError('consentimiento', validateField('consentimiento', getFieldValue('consentimiento')));
      updateSubmitButton(checkFormValidity());
    });
  }

  const form = byId('solicitudForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateForm()) submitForm();
      else focusFirstInvalidField();
    });
  }

  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    const err = byId('documentoIdentificacion-error');
    if (err) err.textContent = 'Para pruebas completas use http://localhost o HTTPS, no file://.';
  }

  updateSubmitButton(false);
}

function handleFileSelected(file) {
  const error = validateFile(file);
  if (!error && file) extractCedulaData(file);
}

function focusFirstInvalidField() {
  for (const fieldId of VALIDATED_FIELDS) {
    const errSpan = byId(fieldId + '-error');
    if (errSpan && errSpan.textContent !== '') {
      const field = byId(fieldId);
      if (field && field.focus) field.focus();
      return;
    }
  }
  const fileErr = byId('documentoIdentificacion-error');
  if (fileErr && fileErr.textContent) {
    const uploadArea = byId('fileUploadArea');
    if (uploadArea && uploadArea.focus) uploadArea.focus();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

if (typeof window !== 'undefined') {
  window.CAFSAFormApp = {
    validateField,
    validateForm,
    validateFile,
    checkFormValidity,
    extractCedulaData,
    submitForm,
    formatCedula,
    formatFechaVencimiento
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateField,
    validateForm,
    validateFile,
    checkFormValidity,
    extractCedulaData,
    submitForm,
    formatCedula,
    formatFechaVencimiento,
    normalizeOcrData,
    applyOcrData,
    getAppConfig,
    VALIDATION_RULES,
    VALIDATED_FIELDS
  };
}
