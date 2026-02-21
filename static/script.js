let baseEnergyJ = 0;
let basePowerW = 0;
let baseCumulativeEnergyJ = 0;
let baseCumulativeEnergyWh = 0;

document.addEventListener('DOMContentLoaded', () => {

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

        if (!validateInputs(mass, footsteps, impact)) return;

        try {
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mass_kg: mass,
                    footsteps_per_minute: footsteps,
                    impact_factor: impact
                })
            });

            const data = await response.json();

            if (data.status === 'success') {

                baseEnergyJ = data.data.energy_per_step_J;
                basePowerW = data.data.power_mW / 1000;

                document.getElementById('resultForce').textContent =
                    data.data.force_N + ' N';

                document.getElementById('resultDisplacement').textContent =
                    data.data.displacement_mm + ' mm';

                updateDisplayedUnits('SI');

                instantCard.style.display = 'block';

                await showDeviceEquivalents(basePowerW);

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

        if (!validateInputs(mass, footsteps, impact, duration)) return;

        try {
            const response = await fetch('/api/calculate-cumulative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mass_kg: mass,
                    footsteps_per_minute: footsteps,
                    duration_minutes: duration,
                    impact_factor: impact
                })
            });

            const data = await response.json();

            if (data.status === 'success') {

                baseCumulativeEnergyJ = data.data.total_energy_J;
                baseCumulativeEnergyWh = data.data.total_energy_Wh;

                document.getElementById('resultSteps').textContent =
                    data.data.total_footsteps;

                document.getElementById('resultDuration').textContent =
                    data.data.duration_minutes + ' min';

                updateCumulativeUnits('SI');

                cumulativeCard.style.display = 'block';

            } else {
                showError(data.error);
            }

        } catch (error) {
            showError('Error calculating cumulative energy: ' + error.message);
        }
    });

    document.querySelectorAll('#instantToggle .toggle-btn')
        .forEach(btn => {
            btn.addEventListener('click', function () {

                document.querySelectorAll('#instantToggle .toggle-btn')
                    .forEach(b => b.classList.remove('active'));

                this.classList.add('active');

                updateDisplayedUnits(this.dataset.unit);
            });
        });

    document.querySelectorAll('#cumulativeToggle .toggle-btn')
        .forEach(btn => {
            btn.addEventListener('click', function () {

                document.querySelectorAll('#cumulativeToggle .toggle-btn')
                    .forEach(b => b.classList.remove('active'));

                this.classList.add('active');

                updateCumulativeUnits(this.dataset.unit);
            });
        });

});

function updateDisplayedUnits(unit = 'SI') {

    const energyElement = document.getElementById('resultEnergy');
    const powerElement = document.getElementById('resultPower');

    if (!energyElement || !powerElement) return;

    if (unit === 'SI') {

        energyElement.textContent = baseEnergyJ.toFixed(4) + ' J';
        powerElement.textContent = (basePowerW * 1000).toFixed(4) + ' mW';

    } else if (unit === 'eV') {

        const energyEV = baseEnergyJ * 6.242e18;

        energyElement.textContent = energyEV.toExponential(4) + ' eV';
        powerElement.textContent = basePowerW.toFixed(4) + ' W';
    }
}

function updateCumulativeUnits(unit = 'SI') {

    const energyElement = document.getElementById('resultEnergyJ');
    const energyWhElement = document.getElementById('resultEnergyWh');

    if (!energyElement || !energyWhElement) return;

    if (unit === 'SI') {

        energyElement.textContent =
            baseCumulativeEnergyJ.toFixed(4) + ' J';

        energyWhElement.textContent =
            baseCumulativeEnergyWh.toFixed(4) + ' Wh';

    } else if (unit === 'eV') {

        const energyEV = baseCumulativeEnergyJ * 6.242e18;

        energyElement.textContent =
            energyEV.toExponential(4) + ' eV';

        energyWhElement.textContent =
            baseCumulativeEnergyWh.toFixed(4) + ' Wh';

    } else if (unit === 'kWh') {

        const energyKWh = baseCumulativeEnergyWh / 1000;

        energyElement.textContent =
            energyKWh.toFixed(6) + ' kWh';

        energyWhElement.textContent =
            baseCumulativeEnergyWh.toFixed(4) + ' Wh';
    }
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

function showError(message) {

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const mainElement = document.querySelector('main');
    mainElement.insertBefore(errorDiv, mainElement.firstChild);

    setTimeout(() => errorDiv.remove(), 5000);
}

async function showDeviceEquivalents(powerWatts) {

    try {
        const response = await fetch('/api/device-equivalents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ power_watts: powerWatts })
        });

        const data = await response.json();

        if (data.status === 'success') {
            displayDeviceEquivalents(data.data);
        }

    } catch (error) {
        console.error('Error fetching device equivalents:', error);
    }
}