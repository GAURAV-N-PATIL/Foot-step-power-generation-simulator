// Unit conversion factors
const UNIT_CONVERSIONS = {
    kg_to_lbs: 2.20462,
    lbs_to_kg: 1 / 2.20462,
    joules_to_eV: 6.242e18  // 1 Joule = 6.242 × 10^18 eV
};

// Store current display unit for energy values
let instantEnergyUnit = 'J';
let cumulativeEnergyUnit = 'J';

// Store original values
let instantEnergyOriginal = null;
let cumulativeEnergyOriginal = null;

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Unit conversion functions
function convertMass(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'kg' && toUnit === 'lbs') {
        return value * UNIT_CONVERSIONS.kg_to_lbs;
    }
    if (fromUnit === 'lbs' && toUnit === 'kg') {
        return value * UNIT_CONVERSIONS.lbs_to_kg;
    }
    return value;
}

// Energy unit conversion function
function convertEnergy(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    // Convert to Joules first if necessary
    let joules = value;
    if (fromUnit === 'eV') {
        joules = value / UNIT_CONVERSIONS.joules_to_eV;
    }
    
    // Convert from Joules to target unit
    if (toUnit === 'eV') {
        return joules * UNIT_CONVERSIONS.joules_to_eV;
    }
    return joules;
}

// Format large numbers for eV display
function formatEV(value) {
    if (value >= 1e18) {
        return (value / 1e18).toFixed(3) + ' × 10¹⁸';
    } else if (value >= 1e15) {
        return (value / 1e15).toFixed(3) + ' × 10¹⁵';
    } else if (value >= 1e12) {
        return (value / 1e12).toFixed(3) + ' × 10¹²';
    } else if (value >= 1e9) {
        return (value / 1e9).toFixed(3) + ' × 10⁹';
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(3) + ' × 10⁶';
    }
    return value.toFixed(3);
}

// Instant Power Energy Unit Conversion
document.addEventListener('DOMContentLoaded', () => {
    const instantConversionBtn = document.getElementById('instant-energy-conversion-btn');
    if (instantConversionBtn) {
        instantConversionBtn.addEventListener('click', toggleInstantEnergyUnit);
    }

    const cumulativeConversionBtn = document.getElementById('cumulative-energy-conversion-btn');
    if (cumulativeConversionBtn) {
        cumulativeConversionBtn.addEventListener('click', toggleCumulativeEnergyUnit);
    }
});

function toggleInstantEnergyUnit() {
    if (!instantEnergyOriginal) return;

    const energyValueElement = document.querySelector('#instant-results .result-value[data-key="energy_per_step_J"]');
    const unitElement = document.getElementById('instant-energy-unit');

    if (instantEnergyUnit === 'J') {
        // Convert to eV
        const eVValue = convertEnergy(instantEnergyOriginal, 'J', 'eV');
        energyValueElement.textContent = formatEV(eVValue);
        unitElement.textContent = 'eV';
        instantEnergyUnit = 'eV';
    } else {
        // Convert back to J
        energyValueElement.textContent = instantEnergyOriginal.toFixed(3);
        unitElement.textContent = 'J';
        instantEnergyUnit = 'J';
    }
}

function toggleCumulativeEnergyUnit() {
    if (!cumulativeEnergyOriginal) return;

    const energyValueElement = document.querySelector('#cumulative-results .result-value[data-key="total_energy_J"]');
    const unitElement = document.getElementById('cumulative-energy-unit');

    if (cumulativeEnergyUnit === 'J') {
        // Convert to eV
        const eVValue = convertEnergy(cumulativeEnergyOriginal, 'J', 'eV');
        energyValueElement.textContent = formatEV(eVValue);
        unitElement.textContent = 'eV';
        cumulativeEnergyUnit = 'eV';
    } else {
        // Convert back to J
        energyValueElement.textContent = cumulativeEnergyOriginal.toFixed(2);
        unitElement.textContent = 'J';
        cumulativeEnergyUnit = 'J';
    }
}

// Instant Power Calculation
function setupInstantPowerTab() {
    const massSlider = document.getElementById('mass-instant');
    const massInput = document.getElementById('mass-instant-input');
    const massUnit = document.getElementById('mass-instant-unit');
    const footstepsSlider = document.getElementById('footsteps-instant');
    const footstepsInput = document.getElementById('footsteps-instant-input');
    const impactSlider = document.getElementById('impact-instant');
    const impactInput = document.getElementById('impact-instant-input');
    const calcBtn = document.getElementById('calculate-instant-btn');

    // Sync mass slider and input
    massSlider.addEventListener('input', (e) => {
        massInput.value = e.target.value;
    });

    massInput.addEventListener('input', (e) => {
        massSlider.value = e.target.value;
    });

    // Sync footsteps slider and input
    footstepsSlider.addEventListener('input', (e) => {
        footstepsInput.value = e.target.value;
    });

    footstepsInput.addEventListener('input', (e) => {
        footstepsSlider.value = e.target.value;
    });

    // Sync impact slider and input
    impactSlider.addEventListener('input', (e) => {
        impactInput.value = e.target.value;
    });

    impactInput.addEventListener('input', (e) => {
        impactSlider.value = e.target.value;
    });

    // Handle unit conversion
    massUnit.addEventListener('change', (e) => {
        const currentValue = parseFloat(massInput.value);
        const newUnit = e.target.value;
        const oldUnit = e.target.previousValue || 'kg';
        
        const convertedValue = convertMass(currentValue, oldUnit, newUnit);
        massInput.value = convertedValue.toFixed(1);
        massSlider.value = convertedValue;
        
        e.target.previousValue = newUnit;
    });

    // Calculate on button click
    calcBtn.addEventListener('click', calculateInstantPower);
}

async function calculateInstantPower() {
    const mass = parseFloat(document.getElementById('mass-instant-input').value);
    const massUnit = document.getElementById('mass-instant-unit').value;
    const footsteps = parseFloat(document.getElementById('footsteps-instant-input').value);
    const impact = parseFloat(document.getElementById('impact-instant-input').value);

    // Convert mass to kg if needed
    const massKg = massUnit === 'lbs' ? mass * UNIT_CONVERSIONS.lbs_to_kg : mass;

    showLoading(true);

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mass_kg: massKg,
                footsteps_per_minute: footsteps,
                impact_factor: impact
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store original energy value for conversion
            instantEnergyOriginal = data.data.energy_per_step_J;
            instantEnergyUnit = 'J';
            displayResults(data.data, 'instant-results');
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error calculating power: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Cumulative Energy Calculation
function setupCumulativeTab() {
    const massSlider = document.getElementById('mass-cumulative');
    const massInput = document.getElementById('mass-cumulative-input');
    const massUnit = document.getElementById('mass-cumulative-unit');
    const footstepsSlider = document.getElementById('footsteps-cumulative');
    const footstepsInput = document.getElementById('footsteps-cumulative-input');
    const durationSlider = document.getElementById('duration-cumulative');
    const durationInput = document.getElementById('duration-cumulative-input');
    const impactSlider = document.getElementById('impact-cumulative');
    const impactInput = document.getElementById('impact-cumulative-input');
    const calcBtn = document.getElementById('calculate-cumulative-btn');

    // Sync mass
    massSlider.addEventListener('input', (e) => {
        massInput.value = e.target.value;
    });

    massInput.addEventListener('input', (e) => {
        massSlider.value = e.target.value;
    });

    // Sync footsteps
    footstepsSlider.addEventListener('input', (e) => {
        footstepsInput.value = e.target.value;
    });

    footstepsInput.addEventListener('input', (e) => {
        footstepsSlider.value = e.target.value;
    });

    // Sync duration
    durationSlider.addEventListener('input', (e) => {
        durationInput.value = e.target.value;
    });

    durationInput.addEventListener('input', (e) => {
        durationSlider.value = e.target.value;
    });

    // Sync impact
    impactSlider.addEventListener('input', (e) => {
        impactInput.value = e.target.value;
    });

    impactInput.addEventListener('input', (e) => {
        impactSlider.value = e.target.value;
    });

    // Handle unit conversion
    massUnit.addEventListener('change', (e) => {
        const currentValue = parseFloat(massInput.value);
        const newUnit = e.target.value;
        const oldUnit = e.target.previousValue || 'kg';
        
        const convertedValue = convertMass(currentValue, oldUnit, newUnit);
        massInput.value = convertedValue.toFixed(1);
        massSlider.value = convertedValue;
        
        e.target.previousValue = newUnit;
    });

    calcBtn.addEventListener('click', calculateCumulativeEnergy);
}

async function calculateCumulativeEnergy() {
    const mass = parseFloat(document.getElementById('mass-cumulative-input').value);
    const massUnit = document.getElementById('mass-cumulative-unit').value;
    const footsteps = parseFloat(document.getElementById('footsteps-cumulative-input').value);
    const duration = parseFloat(document.getElementById('duration-cumulative-input').value);
    const impact = parseFloat(document.getElementById('impact-cumulative-input').value);

    const massKg = massUnit === 'lbs' ? mass * UNIT_CONVERSIONS.lbs_to_kg : mass;

    showLoading(true);

    try {
        const response = await fetch('/api/calculate-cumulative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mass_kg: massKg,
                footsteps_per_minute: footsteps,
                duration_minutes: duration,
                impact_factor: impact
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store original energy value for conversion
            cumulativeEnergyOriginal = data.data.total_energy_J;
            cumulativeEnergyUnit = 'J';
            displayResults(data.data, 'cumulative-results');
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error calculating energy: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Data Generator
function setupGeneratorTab() {
    const massSlider = document.getElementById('mass-generator');
    const massInput = document.getElementById('mass-generator-input');
    const massUnit = document.getElementById('mass-generator-unit');
    const countSlider = document.getElementById('count-generator');
    const countInput = document.getElementById('count-generator-input');
    const generateBtn = document.getElementById('generate-data-btn');

    // Sync mass
    massSlider.addEventListener('input', (e) => {
        massInput.value = e.target.value;
    });

    massInput.addEventListener('input', (e) => {
        massSlider.value = e.target.value;
    });

    // Sync count
    countSlider.addEventListener('input', (e) => {
        countInput.value = e.target.value;
    });

    countInput.addEventListener('input', (e) => {
        countSlider.value = e.target.value;
    });

    // Handle unit conversion
    massUnit.addEventListener('change', (e) => {
        const currentValue = parseFloat(massInput.value);
        const newUnit = e.target.value;
        const oldUnit = e.target.previousValue || 'kg';
        
        const convertedValue = convertMass(currentValue, oldUnit, newUnit);
        massInput.value = convertedValue.toFixed(1);
        massSlider.value = convertedValue;
        
        e.target.previousValue = newUnit;
    });

    generateBtn.addEventListener('click', generateFootstepData);
}

async function generateFootstepData() {
    const mass = parseFloat(document.getElementById('mass-generator-input').value);
    const massUnit = document.getElementById('mass-generator-unit').value;
    const count = parseInt(document.getElementById('count-generator-input').value);

    const massKg = massUnit === 'lbs' ? mass * UNIT_CONVERSIONS.lbs_to_kg : mass;

    showLoading(true);

    try {
        const response = await fetch('/api/generate-footsteps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mass_kg: massKg,
                count: count
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayGeneratorResults(data.data);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error generating data: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function displayGeneratorResults(data) {
    const statsContainer = document.getElementById('generator-stats');
    const tableContainer = document.getElementById('data-table-container');
    const tableBody = document.getElementById('data-tbody');

    const stats = data.statistics;

    statsContainer.innerHTML = `
        <div class="stat-box">
            <h4>Total Footsteps</h4>
            <div class="stat-value">${stats.total_footsteps}</div>
        </div>
        <div class="stat-box">
            <h4>Avg Force</h4>
            <div class="stat-value">${stats.avg_force_N} N</div>
        </div>
        <div class="stat-box">
            <h4>Avg Power</h4>
            <div class="stat-value">${stats.avg_power_W} W</div>
        </div>
        <div class="stat-box">
            <h4>Max Power</h4>
            <div class="stat-value">${stats.max_power_W} W</div>
        </div>
        <div class="stat-box">
            <h4>Min Power</h4>
            <div class="stat-value">${stats.min_power_W} W</div>
        </div>
        <div class="stat-box">
            <h4>Total Energy</h4>
            <div class="stat-value">${stats.total_energy_J} J</div>
            <div class="unit-conversion-btn">${stats.convertEnergy} ev</div>
        </div>
    `;

    tableBody.innerHTML = '';
    data.footsteps.forEach((step, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${step.footstep_id}</td>
            <td>${step.force_N.toFixed(2)}</td>
            <td>${step.displacement_mm.toFixed(2)}</td>
            <td>${step.energy_J.toFixed(3)}</td>
            <td>${step.power_W.toFixed(3)}</td>
        `;
        tableBody.appendChild(row);
    });

    tableContainer.style.display = 'block';
}

// Device Equivalents
function setupDevicesTab() {
    const powerSlider = document.getElementById('power-devices');
    const powerInput = document.getElementById('power-devices-input');
    const calcBtn = document.getElementById('calculate-devices-btn');

    powerSlider.addEventListener('input', (e) => {
        powerInput.value = e.target.value;
    });

    powerInput.addEventListener('input', (e) => {
        powerSlider.value = e.target.value;
    });

    calcBtn.addEventListener('click', calculateDeviceEquivalents);
}

async function calculateDeviceEquivalents() {
    const power = parseFloat(document.getElementById('power-devices-input').value);

    showLoading(true);

    try {
        const response = await fetch('/api/device-equivalents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ power_watts: power })
        });

        const data = await response.json();

        if (response.ok) {
            displayDevices(data.data);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error fetching devices: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function displayDevices(data) {
    const devicesContainer = document.getElementById('devices-grid');
    const chargingContainer = document.getElementById('charging-times');

    devicesContainer.innerHTML = '';
    chargingContainer.innerHTML = '';

    Object.entries(data.devices).forEach(([name, device]) => {
        const canPower = device.can_power;
        const card = document.createElement('div');
        card.className = `device-card ${canPower ? 'can-power' : 'cannot-power'}`;
        card.innerHTML = `
            <div class="device-name">${name}</div>
            <div class="device-power">${device.power}W</div>
            <div class="device-status">
                <span class="status-badge ${canPower ? 'can' : 'cannot'}">
                    ${canPower ? '✓ Can Power' : '✗ Cannot Power'}
                </span>
            </div>
        `;
        devicesContainer.appendChild(card);
    });

    Object.entries(data.charging_times_hours).forEach(([device, hours]) => {
        const item = document.createElement('div');
        item.className = 'charging-item';
        item.innerHTML = `
            <div class="charging-device">${device}</div>
            <div class="charging-time">${hours}</div>
            <div class="charging-unit">hours</div>
        `;
        chargingContainer.appendChild(item);
    });
}

// Display Results
function displayResults(data, containerId) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.result-item');

    items.forEach(item => {
        const key = item.querySelector('.result-value').getAttribute('data-key');
        if (data[key] !== undefined) {
            item.querySelector('.result-value').textContent = data[key];
        }
    });
}

// Loading and Error Handlers
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.classList.add('show');
    } else {
        spinner.classList.remove('show');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');

    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Initialize all tabs on page load
document.addEventListener('DOMContentLoaded', () => {
    setupInstantPowerTab();
    setupCumulativeTab();
    setupGeneratorTab();
    setupDevicesTab();
});