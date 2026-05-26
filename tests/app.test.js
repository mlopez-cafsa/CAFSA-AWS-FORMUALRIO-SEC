/**
 * Tests for current CAFSA form logic
 * @jest-environment jsdom
 */
'use strict';

function setupDOM() {
  document.body.innerHTML = `
    <section id="step1-upload"></section>
    <label id="fileUploadArea" for="documentoIdentificacion"></label>
    <input type="file" id="documentoIdentificacion" name="documentoIdentificacion" accept="application/pdf,.pdf">
    <span class="file-name" id="file-name-display"></span>
    <span class="error-message" id="documentoIdentificacion-error" role="alert"></span>
    <div id="ocr-status" hidden></div>
    <div id="ocr-error" hidden><p id="ocr-error-message"></p><button id="btnManualFill"></button></div>

    <form id="solicitudForm" novalidate hidden>
      <input type="text" id="numeroIdentificacion" name="numeroIdentificacion"><span id="numeroIdentificacion-error"></span>
      <input type="text" id="nombre" name="nombre"><span id="nombre-error"></span>
      <input type="text" id="primerApellido" name="primerApellido"><span id="primerApellido-error"></span>
      <input type="text" id="segundoApellido" name="segundoApellido"><span id="segundoApellido-error"></span>
      <input type="date" id="fechaVencimientoDocumento" name="fechaVencimientoDocumento"><span id="fechaVencimientoDocumento-error"></span>
      <input type="email" id="email" name="email"><span id="email-error"></span>
      <input type="tel" id="numeroTelefono" name="numeroTelefono"><span id="numeroTelefono-error"></span>
      <input type="hidden" id="pais" name="pais" value="CR">
      <select id="provincia" name="provincia"><option value=""></option><option value="SJ">San José</option></select><span id="provincia-error"></span>
      <select id="canton" name="canton"><option value=""></option><option value="San José">San José</option></select><span id="canton-error"></span>
      <select id="distrito" name="distrito"><option value=""></option><option value="Carmen">Carmen</option></select><span id="distrito-error"></span>
      <textarea id="direccionExacta" name="direccionExacta"></textarea><span id="direccionExacta-error"></span>
      <input type="checkbox" id="consentimiento" name="consentimiento"><span id="consentimiento-error"></span>
      <div id="submitError" hidden></div>
      <button type="submit" id="submitBtn">Enviar</button>
      <div id="loadingIndicator" hidden></div>
    </form>
    <section id="confirmacion" hidden><strong id="requestIdDisplay"></strong></section>
  `;
}

function createMockFile(name, size, type) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function setFileOnInput(file) {
  const fileInput = document.getElementById('documentoIdentificacion');
  Object.defineProperty(fileInput, 'files', { value: file ? [file] : [], writable: true, configurable: true });
}

let app;
beforeEach(() => {
  setupDOM();
  jest.resetModules();
  global.CONFIG = {
    API_URL: 'https://api.example.com/dev',
    REQUEST_TIMEOUT: 30000,
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_FILE_TYPES: ['application/pdf'],
    OCR_SERVICE_URL: '',
    ENABLE_DIRECT_OCR: false
  };
  app = require('../js/app.js');
});

describe('validaciones', () => {
  test('valida correo electrónico', () => {
    expect(app.validateField('email', 'user@example.com')).toBe('');
    expect(app.validateField('email', 'incorrecto')).toBe('Ingrese un email válido');
  });

  test('valida teléfono costarricense de 8 dígitos', () => {
    expect(app.validateField('numeroTelefono', '88887777')).toBe('');
    expect(app.validateField('numeroTelefono', '8888-7777')).toBe('Ingrese 8 dígitos sin guiones ni espacios');
  });

  test('valida identificación', () => {
    expect(app.validateField('numeroIdentificacion', '1-2345-6789')).toBe('');
    expect(app.validateField('numeroIdentificacion', 'PA-123456')).toBe('');
    expect(app.validateField('numeroIdentificacion', '123456789')).toBe('Ingrese un número de identificación válido de Costa Rica');
  });

  test('formatea cédula y fecha', () => {
    expect(app.formatCedula('123456789')).toBe('1-2345-6789');
    expect(app.formatFechaVencimiento('07-01-2030')).toBe('2030-01-07');
  });
});

describe('archivo PDF', () => {
  test('acepta PDF válido', () => {
    const file = createMockFile('cedula.pdf', 1024, 'application/pdf');
    expect(app.validateFile(file)).toBe('');
    expect(document.getElementById('file-name-display').textContent).toBe('cedula.pdf');
  });

  test('rechaza archivo no PDF', () => {
    const file = createMockFile('cedula.png', 1024, 'image/png');
    expect(app.validateFile(file)).toBe('Solo se permiten archivos PDF');
  });

  test('rechaza archivo mayor a 10MB', () => {
    const file = createMockFile('grande.pdf', 11 * 1024 * 1024, 'application/pdf');
    expect(app.validateFile(file)).toBe('El archivo no puede exceder 10 MB');
  });
});

describe('OCR', () => {
  test('normaliza respuesta del OCR', () => {
    const data = app.normalizeOcrData({ numero_cedula: '123456789', primer_apellido: 'Lopez', fecha_vencimiento: '07-01-2030' });
    expect(data.numeroIdentificacion).toBe('123456789');
    expect(data.primerApellido).toBe('Lopez');
    expect(data.fechaVencimientoDocumento).toBe('07-01-2030');
  });
});

describe('submit', () => {
  function fillValidForm() {
    document.getElementById('numeroIdentificacion').value = '1-2345-6789';
    document.getElementById('nombre').value = 'Maria';
    document.getElementById('primerApellido').value = 'Lopez';
    document.getElementById('segundoApellido').value = 'Rojas';
    document.getElementById('fechaVencimientoDocumento').value = '2030-01-07';
    document.getElementById('email').value = 'user@example.com';
    document.getElementById('numeroTelefono').value = '88887777';
    document.getElementById('provincia').value = 'SJ';
    document.getElementById('canton').value = 'San José';
    document.getElementById('distrito').value = 'Carmen';
    document.getElementById('direccionExacta').value = 'Avenida Central, San José';
    document.getElementById('consentimiento').checked = true;
    const file = createMockFile('cedula.pdf', 1024, 'application/pdf');
    setFileOnInput(file);
    app.validateFile(file);
  }

  test('envía a API_URL + /submit', async () => {
    fillValidForm();
    global.fetch = jest.fn().mockResolvedValue({ status: 202, json: async () => ({ requestId: 'abc-123' }) });
    await app.submitForm();
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/dev/submit', expect.objectContaining({ method: 'POST' }));
  });
});
