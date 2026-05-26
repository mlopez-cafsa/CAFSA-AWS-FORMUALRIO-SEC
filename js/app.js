(() => {
  'use strict';

  const cfg = window.CAFSA_FORM_CONFIG || {};
  const MAX_FILE_SIZE = Number(cfg.MAX_FILE_MB || 10) * 1024 * 1024;
  const API_ENDPOINT = String(cfg.API_ENDPOINT || '').trim();
  const DEMO_MODE = Boolean(cfg.DEMO_MODE || !API_ENDPOINT);

  const $ = (selector) => document.querySelector(selector);

  const elements = {};

  const setText = (node, message = '') => {
    if (node) node.textContent = message;
  };

  const show = (node) => {
    if (node) node.hidden = false;
  };

  const hide = (node) => {
    if (node) node.hidden = true;
  };

  const setBusy = (isBusy) => {
    if (!elements.submitBtn || !elements.loadingIndicator) return;
    elements.submitBtn.disabled = isBusy;
    elements.form?.setAttribute('aria-busy', String(isBusy));
    isBusy ? show(elements.loadingIndicator) : hide(elements.loadingIndicator);
  };

  const showSubmitError = (message) => {
    setText(elements.submitError, message);
    show(elements.submitError);
  };

  const clearSubmitError = () => {
    setText(elements.submitError, '');
    hide(elements.submitError);
  };

  const openForm = () => {
    if (!elements.form) return;
    show(elements.form);
  };

  const validateFile = (file) => {
    if (!file) {
      setText(elements.fileError, 'Debe seleccionar un archivo PDF válido.');
      return false;
    }

    const fileName = file.name || '';
    const isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setText(elements.fileError, 'Debe seleccionar un archivo en formato PDF.');
      elements.uploadArea?.classList.remove('has-file');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setText(elements.fileError, `El archivo supera el tamaño máximo permitido de ${cfg.MAX_FILE_MB || 10} MB.`);
      elements.uploadArea?.classList.remove('has-file');
      return false;
    }

    setText(elements.fileError, '');
    return true;
  };

  const updateSelectedFile = (file) => {
    if (!validateFile(file)) {
      if (elements.fileInput) elements.fileInput.value = '';
      setText(elements.fileNameDisplay, '');
      return;
    }

    setText(elements.fileNameDisplay, `Archivo seleccionado: ${file.name}`);
    elements.uploadArea?.classList.add('has-file');
    openForm();
  };

  const assignDroppedFile = (file) => {
    if (!elements.fileInput || !file) return;

    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      elements.fileInput.files = dataTransfer.files;
    } catch (_error) {
      // Algunos navegadores restringen la asignación programática de FileList.
      // La validación visual se mantiene, pero el usuario puede seleccionar el archivo con el explorador.
    }
  };

  const initLocalProtocolNotice = () => {
    if (window.location.protocol === 'file:') {
      show(elements.localWarning);
    }
  };

  const initFileUpload = () => {
    if (!elements.uploadArea || !elements.fileInput) return;

    elements.uploadArea.addEventListener('click', (event) => {
      event.preventDefault();
      elements.fileInput.click();
    });

    elements.uploadArea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        elements.fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      elements.uploadArea.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.uploadArea.classList.add('dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      elements.uploadArea.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.uploadArea.classList.remove('dragover');
      });
    });

    elements.uploadArea.addEventListener('drop', (event) => {
      const [file] = Array.from(event.dataTransfer?.files || []);
      if (!file) return;
      assignDroppedFile(file);
      updateSelectedFile(file);
    });

    elements.fileInput.addEventListener('change', () => {
      const [file] = Array.from(elements.fileInput.files || []);
      updateSelectedFile(file);
    });
  };

  const initManualFill = () => {
    elements.manualFillBtn?.addEventListener('click', () => {
      openForm();
      $('#numeroIdentificacion')?.focus();
    });
  };

  const validateRequiredFileBeforeSubmit = () => {
    const [file] = Array.from(elements.fileInput?.files || []);
    return validateFile(file);
  };

  const sendToBackend = async (formData) => {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json'
      },
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return {};
  };

  const showConfirmation = (referenceId) => {
    hide(elements.form);
    hide($('#step1-upload'));
    show(elements.confirmation);
    setText(elements.requestIdDisplay, referenceId || `CAFSA-${Date.now().toString().slice(-8)}`);
    elements.confirmation?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const initFormSubmit = () => {
    if (!elements.form) return;

    elements.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearSubmitError();

      if (!validateRequiredFileBeforeSubmit()) {
        showSubmitError('Debe adjuntar un PDF válido antes de enviar la solicitud.');
        return;
      }

      if (!elements.form.reportValidity()) {
        showSubmitError('Por favor complete correctamente los campos requeridos antes de enviar la solicitud.');
        return;
      }

      const formData = new FormData(elements.form);
      setBusy(true);

      try {
        if (DEMO_MODE) {
          await new Promise((resolve) => window.setTimeout(resolve, 600));
          showConfirmation();
          return;
        }

        const result = await sendToBackend(formData);
        showConfirmation(result.requestId || result.referenceId);
      } catch (_error) {
        showSubmitError('No fue posible enviar la solicitud. Por favor intente nuevamente o contacte a CAFSA.');
      } finally {
        setBusy(false);
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    Object.assign(elements, {
      localWarning: $('#localWarning'),
      fileInput: $('#documentoIdentificacion'),
      uploadArea: $('#fileUploadArea'),
      fileNameDisplay: $('#file-name-display'),
      fileError: $('#documentoIdentificacion-error'),
      form: $('#solicitudForm'),
      manualFillBtn: $('#btnManualFill'),
      loadingIndicator: $('#loadingIndicator'),
      submitBtn: $('#submitBtn'),
      confirmation: $('#confirmacion'),
      requestIdDisplay: $('#requestIdDisplay'),
      submitError: $('#submitError')
    });

    initLocalProtocolNotice();
    initFileUpload();
    initManualFill();
    initFormSubmit();
  });
})();
