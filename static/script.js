const massInput = document.getElementById('mass');
const footstepsInput = document.getElementById('footsteps');
const impactInput = document.getElementById('impact');
const durationInput = document.getElementById('duration');

const massDisplay = document.getElementById('massDisplay');
const footstepsDisplay = document.getElementById('footstepsDisplay');
const impactDisplay = document.getElementById('impactDisplay');
const durationDisplay = document.getElementById('durationDisplay');

const calculateBtn = document.getElementById('calculateBtn');
const cumulativeBtn = document.getElementById('cumulativeBtn');
const generateBtn = document.getElementById('generateBtn');

const instantCard = document.getElementById('instantCard');
const cumulativeCard = document.getElementById('cumulativeCard');
const devicesCard = document.getElementById('devicesCard');
const dataCard = document.getElementById('dataCard');

massInput.addEventListener('input', () => {
    massDisplay.textContent = massInput.value + ' kg';
});

footstepsInput.addEventListener('input', () => {
    footstepsDisplay.textContent = footstepsInput.value + ' steps/min';
});

impactInput.addEventListener('input', () => {
    impactDisplay.textContent = impactInput.value;
});

durationInput.addEventListener('input', () => {
    durationDisplay.textContent = durationInput.value + ' min';
});

calculateBtn.addEventListener('click', async () => {
    const mass = parseFloat(massInput.value);
    const footsteps = parseFloat(footstepsInput.value);
    const impact = parseFloat(impactInput.value);

    if (!validateInputs(mass, footsteps, impact)) {
        return;
    }

    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mass_kg: mass,
                footsteps_per_minute: footsteps,
                impact_factor: impact
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayInstantaneousResults(data.data);
            
            await showDeviceEquivalents(data.data.power_W);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error calculating power: ' + error.message);
    }
});

cumulativeBtn.addEventListener('click', async () => {
    const mass = parseFloat(massInput.value);
    const footsteps = parseFloat(footstepsInput.value);
    const impact = parseFloat(impactInput.value);
    const duration = parseFloat(durationInput.value);

    if (!validateInputs(mass, footsteps, impact, duration)) {
        return;
    }

    try {
        const response = await fetch('/api/calculate-cumulative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mass_kg: mass,
                footsteps_per_minute: footsteps,
                duration_minutes: duration,
                impact_factor: impact
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayCumulativeResults(data.data);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error calculating cumulative energy: ' + error.message);
    }
});

generateBtn.addEventListener('click', async () => {
    const mass = parseFloat(massInput.value);
    const count = 50; 

    if (mass <= 0 || mass > 300) {
        showError('Invalid mass value');
        return;
    }

    try {
        const response = await fetch('/api/generate-footsteps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mass_kg: mass,
                count: count
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayGeneratedData(data.data);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Error generating data: ' + error.message);
    }
});

function displayInstantaneousResults(data) {
    document.getElementById('resultForce').textContent = data.force_N + ' N';
    document.getElementById('resultDisplacement').textContent = data.displacement_mm + ' mm';
    document.getElementById('resultEnergy').textContent = data.energy_per_step_J + ' J';
    document.getElementById('resultPower').textContent = data.power_mW + ' mW';

    instantCard.style.display = 'block';
}

function displayCumulativeResults(data) {
    document.getElementById('resultSteps').textContent = data.total_footsteps;
    document.getElementById('resultDuration').textContent = data.duration_minutes + ' min';
    document.getElementById('resultEnergyJ').textContent = data.total_energy_J + ' J';
    document.getElementById('resultEnergyWh').textContent = data.total_energy_Wh + ' Wh';

    cumulativeCard.style.display = 'block';
}

async function showDeviceEquivalents(powerWatts) {
    try {
        const response = await fetch('/api/device-equivalents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                power_watts: powerWatts
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayDeviceEquivalents(data.data);
        }
    } catch (error) {
        console.error('Error fetching device equivalents:', error);
    }
}

function displayDeviceEquivalents(data) {
    const devicesList = document.getElementById('devicesList');
    const chargingTimes = document.getElementById('chargingTimes');

    devicesList.innerHTML = '';
    chargingTimes.innerHTML = '';

    let html = '';
    for (const [name, info] of Object.entries(data.devices)) {
        const canPower = info.can_power;
        const statusText = canPower ? '✓ Can Power' : '✗ Cannot Power';
        const statusClass = canPower ? 'can-power' : '';

        html += `
            <div class="device-item ${statusClass}">
                <div>
                    <div class="device-name">${name}</div>
                    <div class="device-power">${info.power}W required</div>
                </div>
                <span class="status">${statusText}</span>
            </div>
        `;
    }
    devicesList.innerHTML = html;

    let chargingHtml = '<h4>Charging Times</h4>';
    for (const [device, timeHours] of Object.entries(data.charging_times_hours)) {
        chargingHtml += `
            <div class="charging-item">
                <div class="device-name">${device}</div>
                <div class="time">${timeHours.toFixed(2)} hours</div>
            </div>
        `;
    }
    chargingTimes.innerHTML = chargingHtml;

    devicesCard.style.display = 'block';
}

function displayGeneratedData(data) {
    const statistics = document.getElementById('statistics');
    const dataTable = document.getElementById('dataTable');

    let statsHtml = '';
    for (const [key, value] of Object.entries(data.statistics)) {
        const formattedKey = key.replace(/_/g, ' ').toUpperCase();
        statsHtml += `
            <div class="stat-row">
                <span class="stat-label">${formattedKey}</span>
                <span class="stat-value">${formatValue(value)}</span>
            </div>
        `;
    }
    statistics.innerHTML = statsHtml;

    if (data.footsteps && data.footsteps.length > 0) {
        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Force (N)</th>
                        <th>Displacement (mm)</th>
                        <th>Energy (J)</th>
                        <th>Power (W)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (let i = 0; i < Math.min(10, data.footsteps.length); i++) {
            const step = data.footsteps[i];
            tableHtml += `
                <tr>
                    <td>${step.footstep_id}</td>
                    <td>${step.force_N.toFixed(2)}</td>
                    <td>${step.displacement_mm.toFixed(2)}</td>
                    <td>${step.energy_J.toFixed(3)}</td>
                    <td>${step.power_W.toFixed(3)}</td>
                </tr>
            `;
        }

        if (data.footsteps.length > 10) {
            tableHtml += `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-secondary);">
                        ... and ${data.footsteps.length - 10} more rows
                    </td>
                </tr>
            `;
        }

        tableHtml += '</tbody></table>';
        dataTable.innerHTML = tableHtml;
    }

    dataCard.style.display = 'block';
}

function validateInputs(mass, footsteps, impact, duration = null) {
    if (mass <= 0 || mass > 300) {
        showError('Body mass must be between 1 and 300 kg');
        return false;
    }

    if (footsteps <= 0 || footsteps > 200) {
        showError('Walking pace must be between 1 and 200 steps/min');
        return false;
    }

    if (impact < 1.0 || impact > 2.0) {
        showError('Impact factor must be between 1.0 and 2.0');
        return false;
    }

    if (duration !== null) {
        if (duration <= 0 || duration > 1440) {
            showError('Duration must be between 1 and 1440 minutes');
            return false;
        }
    }

    return true;
}

function formatValue(value) {
    if (typeof value === 'number') {
        if (value > 1000) {
            return value.toFixed(2);
        }
        if (value < 1) {
            return value.toFixed(4);
        }
        return value.toFixed(2);
    }
    return value;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const mainElement = document.querySelector('main');
    mainElement.insertBefore(errorDiv, mainElement.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('Footstep Power Generator Simulator loaded');
});
