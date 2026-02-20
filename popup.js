/**
 * Created by developersakibur
 */

const BRAND_NAME = "developersakibur";

// Default configurations
const DEFAULT_CONFIGS = {
  text: { minValue: 14, minVp: 16, maxValue: 40, maxVp: 72 },
  padding: { minValue: 15, minVp: 20, maxValue: 55, maxVp: 100 }
};

const DEFAULT_VIEWPORT = {
  minWidth: 375,
  maxWidth: 1440
};

// DOM Elements
const minVWEl = document.getElementById("minWidth");
const maxVWEl = document.getElementById("maxWidth");
const minSizeEl = document.getElementById("minSize");
const maxSizeEl = document.getElementById("maxSize");
const resultEl = document.getElementById("result");
const radioButtons = document.querySelectorAll('input[name="propertyType"]');
const configMinValue = document.getElementById("configMinValue");
const configMinVp = document.getElementById("configMinVp");
const configMaxValue = document.getElementById("configMaxValue");
const configMaxVp = document.getElementById("configMaxVp");
const configToggle = document.getElementById("configToggle");
const configSection = document.querySelector(".config-section");

let currentClampValue = "";
let configs = { ...DEFAULT_CONFIGS };
let viewport = { ...DEFAULT_VIEWPORT };
let saveTimeout = null;

// Initialize
async function init() {
  await loadSettings();
  applyConfigsToRadios();
  applyViewportValues();
  const selectedRadio = document.querySelector('input[name="propertyType"]:checked');
  loadConfigInputs(selectedRadio.value);
  updateMinSize();
}

// Load all settings from chrome.storage.sync
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['propertyConfigs', 'viewportSettings', 'configPanelOpen'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        resolve();
        return;
      }
      
      if (result.propertyConfigs) {
        configs = result.propertyConfigs;
      }
      
      if (result.viewportSettings) {
        viewport = result.viewportSettings;
      }
      
      if (result.configPanelOpen) {
        configToggle.checked = true;
        configSection.style.display = 'block';
      }
      
      resolve();
    });
  });
}

// Save settings to chrome.storage.sync (debounced)
function saveSettings() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.sync.set({ 
      propertyConfigs: configs,
      viewportSettings: viewport,
      configPanelOpen: configToggle.checked
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Save error:', chrome.runtime.lastError);
      } else {
        console.log('Settings saved');
      }
    });
  }, 300);
}

// Apply viewport values to inputs
function applyViewportValues() {
  minVWEl.value = viewport.minWidth;
  maxVWEl.value = viewport.maxWidth;
}

// Apply configs to radio data attributes
function applyConfigsToRadios() {
  radioButtons.forEach((radio) => {
    const type = radio.value;
    const config = configs[type];
    if (config) {
      radio.dataset.minVp = config.minVp;
      radio.dataset.maxVp = config.maxVp;
      radio.dataset.minValue = config.minValue;
      radio.dataset.maxValue = config.maxValue;
      radio.dataset.smallSubtract = config.minValue - config.minVp;
    }
  });
}

// Load config inputs for selected radio
function loadConfigInputs(type) {
  const config = configs[type];
  if (config) {
    configMinValue.value = config.minValue;
    configMinVp.value = config.minVp;
    configMaxValue.value = config.maxValue;
    configMaxVp.value = config.maxVp;
  }
}

// Save config from inputs (with auto-reset on empty)
function saveConfigFromInputs() {
  const selectedRadio = document.querySelector('input[name="propertyType"]:checked');
  const type = selectedRadio.value;
  
  const minValueInput = configMinValue.value.trim();
  const minVpInput = configMinVp.value.trim();
  const maxValueInput = configMaxValue.value.trim();
  const maxVpInput = configMaxVp.value.trim();

  // Check if all inputs are empty - auto reset to defaults
  if (!minValueInput && !minVpInput && !maxValueInput && !maxVpInput) {
    configs[type] = { ...DEFAULT_CONFIGS[type] };
    applyConfigsToRadios();
    loadConfigInputs(type);
    saveSettings();
    updateMinSize();
    return;
  }

  const minValue = parseInt(minValueInput) || 1;
  const minVp = parseInt(minVpInput) || 1;
  const maxValue = parseInt(maxValueInput) || 1;
  const maxVp = parseInt(maxVpInput) || 1;

  configs[type] = { minVp, maxVp, minValue, maxValue };
  
  // Update radio data attributes
  selectedRadio.dataset.minVp = minVp;
  selectedRadio.dataset.maxVp = maxVp;
  selectedRadio.dataset.minValue = minValue;
  selectedRadio.dataset.maxValue = maxValue;
  selectedRadio.dataset.smallSubtract = minValue - minVp;

  saveSettings();
  updateMinSize();
}

// Save viewport settings
function saveViewportSettings() {
  const minInput = minVWEl.value.trim();
  const maxInput = maxVWEl.value.trim();

  // Check if both are empty - reset to defaults
  if (!minInput && !maxInput) {
    viewport = { ...DEFAULT_VIEWPORT };
    applyViewportValues();
    saveSettings();
    updateMinSize();
    return;
  }

  viewport.minWidth = parseInt(minInput) || DEFAULT_VIEWPORT.minWidth;
  viewport.maxWidth = parseInt(maxInput) || DEFAULT_VIEWPORT.maxWidth;

  saveSettings();
  updateMinSize();
}

// Get mobile size calculation
function getMobileSize(desktopPx, propertyType) {
  if (!desktopPx || desktopPx < 1) return 1;
  
  if (desktopPx < 10) {
    return Math.max(desktopPx - 1, 1);
  }
  
  const selectedRadio = document.querySelector(`input[name="propertyType"][value="${propertyType}"]`);
  
  if (!selectedRadio || !selectedRadio.dataset.minVp) {
    return Math.round(desktopPx * 0.75);
  }
  
  const minVP = parseInt(selectedRadio.dataset.minVp);
  const maxVP = parseInt(selectedRadio.dataset.maxVp);
  const minValue = parseInt(selectedRadio.dataset.minValue);
  const maxValue = parseInt(selectedRadio.dataset.maxValue);
  const smallSubtract = Math.abs(minVP - minValue);
  
  if (desktopPx < minVP) {
    return Math.max(desktopPx - smallSubtract, 1);
  }
  
  const ratio = (desktopPx - minVP) / (maxVP - minVP);
  const mobileSize = minValue + ratio * (maxValue - minValue);
  
  return Math.round(mobileSize);
}

function updateMinSize() {
  const maxPx = +maxSizeEl.value;
  const selectedProperty = document.querySelector('input[name="propertyType"]:checked').value;

  if (maxPx && maxPx.toString().length >= 2) {
    const calculatedMin = getMobileSize(maxPx, selectedProperty);
    minSizeEl.value = calculatedMin;
    updateClamp();
  }
}

function updateClamp() {
  const minVW = +minVWEl.value;
  const maxVW = +maxVWEl.value;
  const minPx = +minSizeEl.value;
  const maxPx = +maxSizeEl.value;

  resultEl.classList.remove("copied");

  if (!minVW || !maxVW || !minPx || !maxPx) {
    resultEl.innerHTML = '<span class="error-message">Enter max values</span>';
    currentClampValue = "";
    return;
  }

  const slope = (maxPx - minPx) / (maxVW - minVW);
  const vwVal = (slope * 100).toFixed(2);
  const interceptPx = minPx - slope * minVW;

  currentClampValue = `clamp(${minPx}px, ${interceptPx.toFixed(2)}px + ${vwVal}vw, ${maxPx}px)`;
  resultEl.textContent = currentClampValue;
}

function copyClamp() {
  if (!currentClampValue) return;

  navigator.clipboard.writeText(currentClampValue)
    .then(() => {
      resultEl.classList.add("copied");
      setTimeout(() => {
        resultEl.classList.remove("copied");
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
}

// Toggle config panel
function toggleConfigPanel() {
  if (configToggle.checked) {
    configSection.style.display = 'block';
  } else {
    configSection.style.display = 'none';
  }
  saveSettings();
}

// Event Listeners
maxSizeEl.addEventListener("input", updateMinSize);
minSizeEl.addEventListener("input", updateClamp);
minVWEl.addEventListener("input", saveViewportSettings);
maxVWEl.addEventListener("input", saveViewportSettings);

radioButtons.forEach((radio) => {
  radio.addEventListener("change", () => {
    loadConfigInputs(radio.value);
    updateMinSize();
  });
});

configMinValue.addEventListener("input", saveConfigFromInputs);
configMinVp.addEventListener("input", saveConfigFromInputs);
configMaxValue.addEventListener("input", saveConfigFromInputs);
configMaxVp.addEventListener("input", saveConfigFromInputs);

configToggle.addEventListener("change", toggleConfigPanel);

resultEl.addEventListener("click", copyClamp);

// Mouse wheel handlers
function handleWheel(e, inputEl) {
  if (document.activeElement === inputEl) {
    e.preventDefault();
    const currentValue = parseInt(inputEl.value) || 0;
    const min = parseInt(inputEl.min) || -Infinity;
    const max = parseInt(inputEl.max) || Infinity;
    
    let newValue;
    
    // Special case for maxSize: wrap from min to max
    if (inputEl.id === 'maxSize' && e.deltaY > 0 && currentValue === min) {
      newValue = 100;
    } else {
      newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
      newValue = Math.max(min, Math.min(max, newValue));
    }
    
    inputEl.value = newValue;
    inputEl.dispatchEvent(new Event('input'));
  }
}

minSizeEl.addEventListener("wheel", (e) => handleWheel(e, minSizeEl));
maxSizeEl.addEventListener("wheel", (e) => handleWheel(e, maxSizeEl));
configMinValue.addEventListener("wheel", (e) => handleWheel(e, configMinValue));
configMinVp.addEventListener("wheel", (e) => handleWheel(e, configMinVp));
configMaxValue.addEventListener("wheel", (e) => handleWheel(e, configMaxValue));
configMaxVp.addEventListener("wheel", (e) => handleWheel(e, configMaxVp));
minVWEl.addEventListener("wheel", (e) => handleWheel(e, minVWEl));
maxVWEl.addEventListener("wheel", (e) => handleWheel(e, maxVWEl));

// Initialize on load
init();
