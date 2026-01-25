from flask import Flask, render_template, request, jsonify
import os
from calculations import FootstepPowerCalculator
import json

app = Flask(__name__)

# Initialize calculator
calculator = FootstepPowerCalculator()

# Configuration
CSV_UPLOAD_FOLDER = 'data'
if not os.path.exists(CSV_UPLOAD_FOLDER):
    os.makedirs(CSV_UPLOAD_FOLDER)

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def calculate_power():
    """
    Calculate power generated from footsteps.
    
    Expected JSON:
    {
        "mass_kg": 70,
        "footsteps_per_minute": 80,
        "impact_factor": 1.2
    }
    """
    try:
        data = request.get_json()
        
        mass_kg = float(data.get('mass_kg', 70))
        footsteps_per_minute = float(data.get('footsteps_per_minute', 80))
        impact_factor = float(data.get('impact_factor', 1.2))
        
        # Validate inputs
        if mass_kg <= 0 or mass_kg > 300:
            return jsonify({'error': 'Mass must be between 1 and 300 kg'}), 400
        
        if footsteps_per_minute <= 0 or footsteps_per_minute > 200:
            return jsonify({'error': 'Footsteps/min must be between 1 and 200'}), 400
        
        if impact_factor < 1.0 or impact_factor > 2.0:
            return jsonify({'error': 'Impact factor must be between 1.0 and 2.0'}), 400
        
        # Calculate power
        result = calculator.calculate_total_power(mass_kg, footsteps_per_minute, impact_factor)
        
        return jsonify({
            'status': 'success',
            'data': result
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/calculate-cumulative', methods=['POST'])
def calculate_cumulative():
    """
    Calculate cumulative energy over time.
    
    Expected JSON:
    {
        "mass_kg": 70,
        "footsteps_per_minute": 80,
        "duration_minutes": 30,
        "impact_factor": 1.2
    }
    """
    try:
        data = request.get_json()
        
        mass_kg = float(data.get('mass_kg', 70))
        footsteps_per_minute = float(data.get('footsteps_per_minute', 80))
        duration_minutes = float(data.get('duration_minutes', 30))
        impact_factor = float(data.get('impact_factor', 1.2))
        
        # Validate inputs
        if mass_kg <= 0 or mass_kg > 300:
            return jsonify({'error': 'Mass must be between 1 and 300 kg'}), 400
        
        if footsteps_per_minute <= 0 or footsteps_per_minute > 200:
            return jsonify({'error': 'Footsteps/min must be between 1 and 200'}), 400
        
        if duration_minutes <= 0 or duration_minutes > 1440:  # max 24 hours
            return jsonify({'error': 'Duration must be between 1 and 1440 minutes'}), 400
        
        # Calculate cumulative energy
        result = calculator.calculate_cumulative_energy(
            mass_kg, footsteps_per_minute, duration_minutes, impact_factor
        )
        
        return jsonify({
            'status': 'success',
            'data': result
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-footsteps', methods=['POST'])
def generate_footsteps():
    """
    Generate simulated footstep data.
    
    Expected JSON:
    {
        "mass_kg": 70,
        "count": 30
    }
    """
    try:
        data = request.get_json()
        
        mass_kg = float(data.get('mass_kg', 70))
        count = int(data.get('count', 30))
        
        if mass_kg <= 0 or mass_kg > 300:
            return jsonify({'error': 'Mass must be between 1 and 300 kg'}), 400
        
        if count <= 0 or count > 500:
            return jsonify({'error': 'Count must be between 1 and 500'}), 400
        
        # Generate data
        df = calculator.generate_footstep_data(mass_kg, count)
        
        # Convert to JSON
        data_dict = {
            'footsteps': df.to_dict('records'),
            'statistics': calculator.analyze_footstep_data(df)
        }
        
        # Format timestamps
        for record in data_dict['footsteps']:
            record['timestamp'] = str(record['timestamp'])
        
        return jsonify({
            'status': 'success',
            'data': data_dict
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/device-equivalents', methods=['POST'])
def device_equivalents():
    """
    Show what devices can be powered by generated energy.
    
    Expected JSON:
    {
        "power_watts": 5
    }
    """
    try:
        data = request.get_json()
        power_watts = float(data.get('power_watts', 1))
        
        # Device power requirements (watts)
        devices = {
            'LED Bulb (1W)': {'power': 1, 'can_power': power_watts >= 1},
            'Phone Charger (5W)': {'power': 5, 'can_power': power_watts >= 5},
            'Smartwatch (2W)': {'power': 2, 'can_power': power_watts >= 2},
            'Bluetooth Speaker (5W)': {'power': 5, 'can_power': power_watts >= 5},
            'Wireless Sensor (0.5W)': {'power': 0.5, 'can_power': power_watts >= 0.5},
            'LED Flashlight (3W)': {'power': 3, 'can_power': power_watts >= 3},
        }
        
        # Calculate charging time for common devices
        device_capacities = {
            'Smartphone': {'mah': 3500, 'voltage': 5},  # 17.5 Wh
            'Smartwatch': {'mah': 300, 'voltage': 3.7},  # 1.11 Wh
            'Wireless Earbuds': {'mah': 50, 'voltage': 3.7},  # 0.185 Wh
        }
        
        charging_times = {}
        for device, specs in device_capacities.items():
            energy_wh = (specs['mah'] * specs['voltage']) / 1000
            if power_watts > 0:
                time_hours = energy_wh / power_watts
                charging_times[device] = round(time_hours, 2)
        
        return jsonify({
            'status': 'success',
            'data': {
                'devices': devices,
                'charging_times_hours': charging_times
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
