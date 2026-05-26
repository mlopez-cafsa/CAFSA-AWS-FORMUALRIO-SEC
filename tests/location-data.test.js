/**
 * Tests for location dynamics (Task 18)
 * @jest-environment jsdom
 */
'use strict';

function setupDOM() {
  document.body.innerHTML = `
    <select id="provincia">
      <option value="">-- Seleccione una provincia --</option>
      <option value="SJ">San José</option>
      <option value="AL">Alajuela</option>
      <option value="CA">Cartago</option>
      <option value="HE">Heredia</option>
      <option value="GU">Guanacaste</option>
      <option value="PU">Puntarenas</option>
      <option value="LI">Limón</option>
    </select>
    <select id="canton" disabled>
      <option value="">-- Seleccione un cantón --</option>
    </select>
    <select id="distrito" disabled>
      <option value="">-- Seleccione un distrito --</option>
    </select>
  `;
}

let locationModule;

beforeEach(() => {
  setupDOM();
  jest.resetModules();
  locationModule = require('./location-data.js');
});

describe('CANTONES data', () => {
  test('has all 7 provinces', () => {
    const { CANTONES } = locationModule;
    expect(Object.keys(CANTONES)).toHaveLength(7);
    expect(CANTONES).toHaveProperty('SJ');
    expect(CANTONES).toHaveProperty('AL');
    expect(CANTONES).toHaveProperty('CA');
    expect(CANTONES).toHaveProperty('HE');
    expect(CANTONES).toHaveProperty('GU');
    expect(CANTONES).toHaveProperty('PU');
    expect(CANTONES).toHaveProperty('LI');
  });

  test('San José has 20 cantones', () => {
    expect(locationModule.CANTONES.SJ).toHaveLength(20);
  });

  test('Alajuela has 15 cantones', () => {
    expect(locationModule.CANTONES.AL).toHaveLength(15);
  });

  test('Cartago has 6 cantones', () => {
    expect(locationModule.CANTONES.CA).toHaveLength(6);
  });

  test('Heredia has 6 cantones', () => {
    expect(locationModule.CANTONES.HE).toHaveLength(6);
  });

  test('Guanacaste has 11 cantones', () => {
    expect(locationModule.CANTONES.GU).toHaveLength(11);
  });

  test('Puntarenas has 11 cantones', () => {
    expect(locationModule.CANTONES.PU).toHaveLength(11);
  });

  test('Limón has 6 cantones', () => {
    expect(locationModule.CANTONES.LI).toHaveLength(6);
  });
});

describe('DISTRITOS data', () => {
  test('every canton has at least 1 distrito', () => {
    const { CANTONES, DISTRITOS } = locationModule;
    for (const provincia of Object.keys(CANTONES)) {
      for (const canton of CANTONES[provincia]) {
        expect(DISTRITOS[canton]).toBeDefined();
        expect(DISTRITOS[canton].length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('San José canton has 11 distritos', () => {
    expect(locationModule.DISTRITOS['San José']).toHaveLength(11);
  });

  test('Cartago canton has 11 distritos', () => {
    expect(locationModule.DISTRITOS['Cartago']).toHaveLength(11);
  });
});

describe('populateCantones', () => {
  test('populates canton select with cantones for given province', () => {
    locationModule.populateCantones('SJ');
    const cantonSelect = document.getElementById('canton');
    // 20 cantones + 1 placeholder
    expect(cantonSelect.options).toHaveLength(21);
    expect(cantonSelect.disabled).toBe(false);
  });

  test('enables canton select when province is selected', () => {
    locationModule.populateCantones('AL');
    const cantonSelect = document.getElementById('canton');
    expect(cantonSelect.disabled).toBe(false);
  });

  test('resets and disables canton when province is empty', () => {
    // First populate
    locationModule.populateCantones('SJ');
    // Then reset
    locationModule.populateCantones('');
    const cantonSelect = document.getElementById('canton');
    expect(cantonSelect.options).toHaveLength(1);
    expect(cantonSelect.disabled).toBe(true);
  });

  test('resets and disables distrito when province changes', () => {
    // Simulate a full flow
    locationModule.populateCantones('SJ');
    locationModule.populateDistritos('San José');
    // Now change province
    locationModule.populateCantones('AL');
    const distritoSelect = document.getElementById('distrito');
    expect(distritoSelect.options).toHaveLength(1);
    expect(distritoSelect.disabled).toBe(true);
  });

  test('canton options use canton name as both value and text', () => {
    locationModule.populateCantones('CA');
    const cantonSelect = document.getElementById('canton');
    const firstCanton = cantonSelect.options[1]; // skip placeholder
    expect(firstCanton.value).toBe('Cartago');
    expect(firstCanton.textContent).toBe('Cartago');
  });
});

describe('populateDistritos', () => {
  test('populates distrito select with distritos for given canton', () => {
    locationModule.populateDistritos('San José');
    const distritoSelect = document.getElementById('distrito');
    // 11 distritos + 1 placeholder
    expect(distritoSelect.options).toHaveLength(12);
    expect(distritoSelect.disabled).toBe(false);
  });

  test('enables distrito select when canton is selected', () => {
    locationModule.populateDistritos('Escazú');
    const distritoSelect = document.getElementById('distrito');
    expect(distritoSelect.disabled).toBe(false);
    // 3 distritos + 1 placeholder
    expect(distritoSelect.options).toHaveLength(4);
  });

  test('resets and disables distrito when canton is empty', () => {
    locationModule.populateDistritos('San José');
    locationModule.populateDistritos('');
    const distritoSelect = document.getElementById('distrito');
    expect(distritoSelect.options).toHaveLength(1);
    expect(distritoSelect.disabled).toBe(true);
  });

  test('distrito options use distrito name as both value and text', () => {
    locationModule.populateDistritos('Escazú');
    const distritoSelect = document.getElementById('distrito');
    const firstDistrito = distritoSelect.options[1]; // skip placeholder
    expect(firstDistrito.value).toBe('Escazú');
    expect(firstDistrito.textContent).toBe('Escazú');
  });
});

describe('initLocationDynamics', () => {
  test('provincia change event triggers canton population', () => {
    locationModule.initLocationDynamics();
    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.value = 'SJ';
    provinciaSelect.dispatchEvent(new Event('change'));

    const cantonSelect = document.getElementById('canton');
    expect(cantonSelect.disabled).toBe(false);
    expect(cantonSelect.options.length).toBeGreaterThan(1);
  });

  test('canton change event triggers distrito population', () => {
    locationModule.initLocationDynamics();
    // First select province
    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.value = 'SJ';
    provinciaSelect.dispatchEvent(new Event('change'));

    // Then select canton
    const cantonSelect = document.getElementById('canton');
    cantonSelect.value = 'San José';
    cantonSelect.dispatchEvent(new Event('change'));

    const distritoSelect = document.getElementById('distrito');
    expect(distritoSelect.disabled).toBe(false);
    expect(distritoSelect.options.length).toBeGreaterThan(1);
  });

  test('changing province to empty disables both canton and distrito', () => {
    locationModule.initLocationDynamics();
    // Select province
    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.value = 'SJ';
    provinciaSelect.dispatchEvent(new Event('change'));

    // Then clear province
    provinciaSelect.value = '';
    provinciaSelect.dispatchEvent(new Event('change'));

    const cantonSelect = document.getElementById('canton');
    const distritoSelect = document.getElementById('distrito');
    expect(cantonSelect.disabled).toBe(true);
    expect(distritoSelect.disabled).toBe(true);
  });
});
