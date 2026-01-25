# ⚡ Footstep Power Generator Simulator

A physics-based web application that simulates and calculates energy harvesting from human footsteps using piezoelectric technology.

## 📁 Project Structure

```
footstep-power-generator/
├── app.py                  # Flask backend
├── calculations.py         # NumPy + Pandas physics calculations
├── requirements.txt        # Python dependencies
│
├── templates/
│   └── index.html          # Web interface
│
├── static/
│   ├── style.css          # Modern dark theme styling
│   └── script.js          # Client-side request/response logic
│
└── data/
    └── footstep_data.csv  # Sample footstep data
```

## 🎯 Features

### **1. Instantaneous Power Calculation**
- Calculate real-time power generated from a single footstep
- Parameters: body mass, walking pace, impact factor
- Output: Force (N), Displacement (mm), Energy (J), Power (mW)

### **2. Cumulative Energy Analysis**
- Calculate total energy generated over a period
- Extended calculations over minutes/hours
- Output: Total footsteps, Energy in Joules and Watt-hours

### **3. Device Power Equivalents**
- Shows which devices can be powered by generated energy
- LED, smartphone charger, smartwatch, speakers, sensors
- Calculates charging times for common devices

### **4. Footstep Data Generation**
- Simulates realistic footstep patterns with variance
- Statistical analysis of generated data
- Exportable data table

## 🔬 Physics Model

### Fundamental Equations

**Impact Force:**
```
F = m × g × impact_factor
```
where:
- m = person's mass (kg)
- g = 9.81 m/s²
- impact_factor = 1.0-2.0 (dynamic effect)

**Ground Displacement:**
```
x = F / stiffness
```
where:
- stiffness ≈ 50,000 N/m (typical ground/shoe)

**Energy per Footstep:**
```
E = F × x × efficiency × damping
```
where:
- efficiency = 60% (piezoelectric conversion)
- damping = 0.8 (energy loss factor)

**Average Power:**
```
P = E / contact_time
```
where:
- contact_time ≈ 0.3 seconds

## 📊 Typical Values

| Parameter | Range |
|-----------|-------|
| Human mass | 30-300 kg |
| Walking pace | 60-120 steps/min |
| Impact force | 700-1000 N |
| Power per step | 5-50 mW |
| Continuous power | 5-15 W |

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Purpose of making this: For college project.

## 📡 API Endpoints

### 1. **Calculate Instantaneous Power**
```
POST /api/calculate
Content-Type: application/json

{
    "mass_kg": 70,
    "footsteps_per_minute": 80,
    "impact_factor": 1.2
}

Response:
{
    "status": "success",
    "data": {
        "force_N": 826.74,
        "displacement_mm": 1.65,
        "energy_per_step_J": 13.63,
        "footsteps_per_sec": 1.33,
        "power_W": 18.18,
        "power_mW": 18180.0
    }
}
```

### 2. **Calculate Cumulative Energy**
```
POST /api/calculate-cumulative
Content-Type: application/json

{
    "mass_kg": 70,
    "footsteps_per_minute": 80,
    "duration_minutes": 30,
    "impact_factor": 1.2
}

Response:
{
    "status": "success",
    "data": {
        "power_W": 18.18,
        "duration_minutes": 30,
        "total_energy_J": 32724.0,
        "total_energy_Wh": 9.09,
        "total_energy_kWh": 0.00909,
        "total_footsteps": 2400
    }
}
```

### 3. **Generate Footstep Data**
```
POST /api/generate-footsteps
Content-Type: application/json

{
    "mass_kg": 70,
    "count": 30
}

Response:
{
    "status": "success",
    "data": {
        "footsteps": [...],
        "statistics": {
            "total_footsteps": 30,
            "avg_force_N": 826.45,
            "avg_power_W": 45.23,
            "max_power_W": 49.75,
            "min_power_W": 42.15,
            "total_energy_J": 1234.56,
            "avg_energy_J": 41.15
        }
    }
}
```

### 4. **Device Equivalents**
```
POST /api/device-equivalents
Content-Type: application/json

{
    "power_watts": 5
}

Response:
{
    "status": "success",
    "data": {
        "devices": {
            "LED Bulb (1W)": {"power": 1, "can_power": true},
            "Phone Charger (5W)": {"power": 5, "can_power": true},
            ...
        },
        "charging_times_hours": {
            "Smartphone": 3.48,
            "Smartwatch": 0.22,
            "Wireless Earbuds": 0.037
        }
    }
}
```

## 💻 Technology Stack

- **Backend**: Flask (Python web framework)
- **Physics Calculations**: NumPy (numerical computing)
- **Data Analysis**: Pandas (data manipulation)
- **Frontend**: HTML5, CSS3 (modern dark theme)
- **Client Logic**: Vanilla JavaScript (async/await, fetch API)

## 🎨 UI Features

- **Dark modern theme** with gradient accents
- **Real-time input display** with range sliders
- **Interactive result cards** with smooth animations
- **Responsive design** for mobile and desktop
- **Data visualization** in table format
- **Error handling** with user-friendly messages

## 📈 Example Scenarios

### Scenario 1: Light Walking (30 min)
```
Mass: 60 kg
Pace: 80 steps/min
Energy generated: 26.3 Wh
Charge time for smartphone: ~4 hours
```

### Scenario 2: Brisk Walking (1 hour)
```
Mass: 80 kg
Pace: 120 steps/min
Energy generated: 64.8 Wh
Charge time for smartphone: ~1.5 hours
```

### Scenario 3: Running (20 min)
```
Mass: 75 kg
Pace: 160 steps/min
Impact factor: 1.5
Energy generated: 36.2 Wh
Can power LED lighting continuously
```

## 🔮 Real-World Applications

1. **Wearable Devices**: Charge smartwatches and fitness trackers
2. **Emergency Systems**: Power flashlights in disaster zones
3. **Remote Sensors**: Keep IoT devices running in off-grid areas
4. **Sports Equipment**: Self-powered shoe insoles
5. **Public Spaces**: Generate power from foot traffic

## 📚 Physics References

- Footstep energy harvesting efficiency: 60-80%
- Typical piezoelectric conversion: 50-60%
- Human gait biomechanics: 0.3s contact time
- Ground stiffness: 40,000-60,000 N/m

## ⚙️ Customization

### Modify Efficiency
Edit `calculations.py`:
```python
self.PIEZO_EFFICIENCY = 0.6  # Change to your material's efficiency
```

### Add More Devices
Edit `app.py` in `device_equivalents()`:
```python
devices = {
    'New Device (5W)': {'power': 5, 'can_power': power_watts >= 5},
    ...
}
```

### Adjust Physics Parameters
Edit `calculations.py`:
```python
self.GRAVITY = 9.81
self.IMPACT_DAMPING = 0.8
```

## 📝 Notes

- All calculations use SI units (Newton, meters, joules, watts)
- Impact factor varies with shoe type and surface material
- Piezoelectric efficiency depends on material and design
- Real-world power generation may vary by ±30%

## 🤝 Contributing

Feel free to extend this simulator with:
- More device types
- Advanced materials database
- 3D gait visualization
- Machine learning predictions
- Real sensor data integration

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created as an educational physics simulation tool. by <b>Gaurav-Patil<b>

---

**Enjoy exploring the potential of footstep energy harvesting! ⚡👟**
