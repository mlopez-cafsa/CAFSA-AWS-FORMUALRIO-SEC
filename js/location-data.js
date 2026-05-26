/**
 * Datos de ubicación geográfica de Costa Rica
 * Provincias, Cantones y Distritos
 * Tarea 18: Dinámicas de provincia/cantón/distrito
 */
'use strict';

// ============================================================
// Datos de Cantones por Provincia
// ============================================================

const CANTONES = {
  SJ: [
    'San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú',
    'Aserrí', 'Mora', 'Goicoechea', 'Santa Ana', 'Alajuelita',
    'Coronado', 'Acosta', 'Tibás', 'Moravia', 'Montes de Oca',
    'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón', 'León Cortés'
  ],
  AL: [
    'Alajuela', 'San Ramón', 'Grecia', 'San Isidro', 'Naranjo',
    'Palmares', 'San Carlos', 'Fortuna', 'Upala', 'Los Chiles',
    'Guatuso', 'Río Cuarto', 'Pocosol', 'Valverde Vega', 'Orotina'
  ],
  CA: [
    'Cartago', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Oreamuno'
  ],
  HE: [
    'Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Isidro', 'Belén'
  ],
  GU: [
    'Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo',
    'Cañas', 'Abangares', 'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha'
  ],
  PU: [
    'Puntarenas', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa',
    'Quepos', 'Golfito', 'Coto Brus', 'Parrita', 'Corredores', 'Garabito'
  ],
  LI: [
    'Limón', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo'
  ]
};

// ============================================================
// Datos de Distritos por Cantón
// ============================================================

const DISTRITOS = {
  // San José Province
  'San José': ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote', 'San Francisco de Dos Ríos', 'La Uruca', 'Mata Redonda', 'Pavas', 'San Sebastián', 'Hatillo'],
  'Escazú': ['Escazú', 'San Antonio', 'San Rafael'],
  'Desamparados': ['Desamparados', 'San Miguel', 'San Juan de Dios', 'San Rafael Arriba', 'San Antonio'],
  'Puriscal': ['Santiago', 'Mercedes Sur', 'Barbacoas'],
  'Tarrazú': ['San Marcos', 'San Lorenzo', 'San Carlos'],
  'Aserrí': ['Aserrí', 'Tarbaca', 'Vuelta de Jorco'],
  'Mora': ['Colón', 'Guayabo', 'Tabarcia'],
  'Goicoechea': ['Guadalupe', 'San Francisco', 'Calle Blancos', 'Mata de Plátano', 'Ipís'],
  'Santa Ana': ['Santa Ana', 'Salitral', 'Pozos', 'Uruca', 'Piedades', 'Brasil'],
  'Alajuelita': ['Alajuelita', 'San Josecito', 'San Antonio', 'Concepción', 'San Felipe'],
  'Coronado': ['San Isidro', 'San Rafael', 'Dulce Nombre de Jesús', 'Patalillo', 'Cascajal'],
  'Acosta': ['San Ignacio', 'Guaitil', 'Palmichal'],
  'Tibás': ['San Juan', 'Cinco Esquinas', 'Anselmo Llorente', 'León XIII', 'Colima'],
  'Moravia': ['San Vicente', 'San Jerónimo', 'La Trinidad'],
  'Montes de Oca': ['San Pedro', 'Sabanilla', 'Mercedes', 'San Rafael'],
  'Turrubares': ['San Pablo', 'San Pedro', 'San Juan de Mata'],
  'Dota': ['Santa María', 'Jardín', 'Copey'],
  'Curridabat': ['Curridabat', 'Granadilla', 'Sánchez', 'Tirrases'],
  'Pérez Zeledón': ['San Isidro de El General', 'El General', 'Daniel Flores', 'Rivas', 'San Pedro'],
  'León Cortés': ['San Pablo', 'San Andrés', 'Llano Bonito'],

  // Alajuela Province
  'Alajuela': ['Alajuela', 'San José', 'Carrizal', 'San Antonio', 'Guácima', 'San Isidro', 'Sabanilla', 'San Rafael', 'Río Segundo', 'Desamparados', 'Turrúcares', 'Tambor', 'Garita', 'Sarapiquí'],
  'San Ramón': ['San Ramón', 'Santiago', 'San Juan', 'Piedades Norte', 'Piedades Sur'],
  'Grecia': ['Grecia', 'San Isidro', 'San José', 'San Roque', 'Tacares'],
  'San Isidro': ['San Isidro', 'San José', 'Sabanilla'],
  'Naranjo': ['Naranjo', 'San Miguel', 'San José', 'Cirrí Sur', 'San Jerónimo'],
  'Palmares': ['Palmares', 'Zaragoza', 'Buenos Aires', 'Santiago', 'Candelaria'],
  'San Carlos': ['Quesada', 'Florencia', 'Buenavista', 'Aguas Zarcas', 'Venecia'],
  'Fortuna': ['Fortuna', 'La Tigra', 'San Juan'],
  'Upala': ['Upala', 'Aguas Claras', 'San José', 'Bijagua'],
  'Los Chiles': ['Los Chiles', 'Caño Negro', 'El Amparo'],
  'Guatuso': ['San Rafael', 'Buenavista', 'Cote'],
  'Río Cuarto': ['Río Cuarto', 'Santa Rita', 'Santa Isabel'],
  'Pocosol': ['Pocosol', 'La Palmera', 'Cutris'],
  'Valverde Vega': ['Sarchí Norte', 'Sarchí Sur', 'Toro Amarillo'],
  'Orotina': ['Orotina', 'El Mastate', 'Hacienda Vieja'],

  // Cartago Province
  'Cartago': ['Oriental', 'Occidental', 'Carmen', 'San Nicolás', 'Aguacaliente', 'Guadalupe', 'Corralillo', 'Tierra Blanca', 'Dulce Nombre', 'Llano Grande', 'Quebradilla'],
  'Paraíso': ['Paraíso', 'Santiago', 'Orosi', 'Cachí', 'Llanos de Santa Lucía'],
  'La Unión': ['Tres Ríos', 'San Diego', 'San Juan', 'San Rafael', 'Concepción'],
  'Jiménez': ['Juan Viñas', 'Tucurrique', 'Pejibaye'],
  'Turrialba': ['Turrialba', 'La Suiza', 'Peralta', 'Santa Cruz', 'Santa Teresita'],
  'Oreamuno': ['San Rafael', 'Cot', 'Potrero Cerrado', 'Cipreses', 'Santa Rosa'],

  // Heredia Province
  'Heredia': ['Heredia', 'Mercedes', 'San Francisco', 'Ulloa', 'Varablanca'],
  'Barva': ['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucía'],
  'Santo Domingo': ['Santo Domingo', 'San Vicente', 'San Miguel', 'Paracito', 'Santo Tomás'],
  'Santa Bárbara': ['Santa Bárbara', 'San Pedro', 'San Juan', 'Jesús', 'Santo Domingo'],
  'San Isidro': ['San Isidro', 'San José', 'Concepción'],
  'Belén': ['San Antonio', 'La Ribera', 'La Asunción'],

  // Guanacaste Province
  'Liberia': ['Liberia', 'Cañas Dulces', 'Mayorga', 'Nacascolo', 'Curubandé'],
  'Nicoya': ['Nicoya', 'Mansión', 'San Antonio', 'Quebrada Honda', 'Sámara'],
  'Santa Cruz': ['Santa Cruz', 'Bolsón', 'Veintisiete de Abril', 'Tempate', 'Cartagena'],
  'Bagaces': ['Bagaces', 'La Fortuna', 'Mogote'],
  'Carrillo': ['Filadelfia', 'Palmira', 'Sardinal', 'Belén'],
  'Cañas': ['Cañas', 'Palmira', 'San Miguel', 'Bebedero', 'Porozal'],
  'Abangares': ['Las Juntas', 'Sierra', 'San Juan', 'Colorado'],
  'Tilarán': ['Tilarán', 'Quebrada Grande', 'Tronadora', 'Santa Rosa', 'Líbano'],
  'Nandayure': ['Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir'],
  'La Cruz': ['La Cruz', 'Santa Cecilia', 'La Garita', 'Santa Elena'],
  'Hojancha': ['Hojancha', 'Monte Romo', 'Puerto Carrillo', 'Huacas'],

  // Puntarenas Province
  'Puntarenas': ['Puntarenas', 'Pitahaya', 'Chomes', 'Lepanto', 'Paquera', 'Manzanillo', 'Guacimal', 'Barranca', 'Monte Verde', 'Isla del Coco', 'Cóbano', 'Chacarita', 'Chira', 'Acapulco', 'El Roble', 'Arancibia'],
  'Esparza': ['Espíritu Santo', 'San Juan Grande', 'Macacona', 'San Rafael', 'San Jerónimo'],
  'Buenos Aires': ['Buenos Aires', 'Volcán', 'Potrero Grande', 'Boruca', 'Pilas'],
  'Montes de Oro': ['Miramar', 'La Unión', 'San Isidro'],
  'Osa': ['Puerto Cortés', 'Palmar', 'Sierpe', 'Bahía Ballena', 'Piedras Blancas'],
  'Quepos': ['Quepos', 'Savegre', 'Naranjito'],
  'Golfito': ['Golfito', 'Puerto Jiménez', 'Guaycará', 'Pavón'],
  'Coto Brus': ['San Vito', 'Sabalito', 'Aguabuena', 'Limoncito', 'Pittier'],
  'Parrita': ['Parrita'],
  'Corredores': ['Corredor', 'La Cuesta', 'Canoas', 'Laurel'],
  'Garabito': ['Jacó', 'Tárcoles'],

  // Limón Province
  'Limón': ['Limón', 'Valle La Estrella', 'Río Blanco', 'Matama'],
  'Pococí': ['Guápiles', 'Jiménez', 'Rita', 'Roxana', 'Cariari'],
  'Siquirres': ['Siquirres', 'Pacuarito', 'Florida', 'Germania', 'El Cairo'],
  'Talamanca': ['Bratsi', 'Sixaola', 'Cahuita', 'Telire'],
  'Matina': ['Matina', 'Batán', 'Carrandi'],
  'Guácimo': ['Guácimo', 'Mercedes', 'Pocora', 'Río Jiménez', 'Duacarí']
};

// ============================================================
// Funciones de Dinámicas de Ubicación
// ============================================================

/**
 * Popula el select de cantones basado en la provincia seleccionada.
 * @param {string} provinciaCode - Código de la provincia (SJ, AL, CA, HE, GU, PU, LI)
 */
function populateCantones(provinciaCode) {
  const cantonSelect = document.getElementById('canton');
  const distritoSelect = document.getElementById('distrito');

  if (!cantonSelect || !distritoSelect) return;

  // Reset cantón
  cantonSelect.innerHTML = '<option value="">-- Seleccione un cantón --</option>';
  cantonSelect.disabled = true;

  // Reset distrito
  distritoSelect.innerHTML = '<option value="">-- Seleccione un distrito --</option>';
  distritoSelect.disabled = true;

  if (!provinciaCode || !CANTONES[provinciaCode]) return;

  // Populate cantones
  const cantones = CANTONES[provinciaCode];
  for (const canton of cantones) {
    const option = document.createElement('option');
    option.value = canton;
    option.textContent = canton;
    cantonSelect.appendChild(option);
  }

  // Enable cantón select
  cantonSelect.disabled = false;
}

/**
 * Popula el select de distritos basado en el cantón seleccionado.
 * @param {string} cantonName - Nombre del cantón
 */
function populateDistritos(cantonName) {
  const distritoSelect = document.getElementById('distrito');

  if (!distritoSelect) return;

  // Reset distrito
  distritoSelect.innerHTML = '<option value="">-- Seleccione un distrito --</option>';
  distritoSelect.disabled = true;

  if (!cantonName || !DISTRITOS[cantonName]) return;

  // Populate distritos
  const distritos = DISTRITOS[cantonName];
  for (const distrito of distritos) {
    const option = document.createElement('option');
    option.value = distrito;
    option.textContent = distrito;
    distritoSelect.appendChild(option);
  }

  // Enable distrito select
  distritoSelect.disabled = false;
}

/**
 * Initializes location dynamics event listeners.
 */
function initLocationDynamics() {
  const provinciaSelect = document.getElementById('provincia');
  const cantonSelect = document.getElementById('canton');

  if (provinciaSelect) {
    provinciaSelect.addEventListener('change', function () {
      const provinciaCode = this.value;
      populateCantones(provinciaCode);
    });
  }

  if (cantonSelect) {
    cantonSelect.addEventListener('change', function () {
      const cantonName = this.value;
      populateDistritos(cantonName);
    });
  }
}

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  initLocationDynamics();
});

// Expose functions globally for testing and external use
if (typeof window !== 'undefined') {
  window.populateCantones = populateCantones;
  window.populateDistritos = populateDistritos;
  window.initLocationDynamics = initLocationDynamics;
  window.CANTONES = CANTONES;
  window.DISTRITOS = DISTRITOS;
}

// Support CommonJS for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CANTONES,
    DISTRITOS,
    populateCantones,
    populateDistritos,
    initLocationDynamics
  };
}
