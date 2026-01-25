import numpy as np
import pandas as pd
from datetime import datetime

class FootstepPowerCalculator:
    """
    Calculates power generated from footstep energy harvesting.
    
    Physics:
    - Power = Force × Velocity
    - Force from footstep = person's mass × gravity × impact factor
    - Average human footstep: 700N - 1000N
    """
    
    def __init__(self):
        self.GRAVITY = 9.81  # m/s²
        self.PIEZO_EFFICIENCY = 0.6  # 60% efficiency
        self.IMPACT_DAMPING = 0.8  # Energy loss factor
        
    def calculate_impact_force(self, mass_kg, impact_factor=1.2):
        """
        Calculate impact force from a footstep.
        
        Args:
            mass_kg: Person's mass in kg
            impact_factor: Multiplier for dynamic impact (1.0-1.5)
        
        Returns:
            Force in Newtons
        """
        force = mass_kg * self.GRAVITY * impact_factor
        return force
    
    def calculate_displacement(self, force, stiffness=50000):
        """
        Calculate ground displacement during footstep.
        
        Args:
            force: Impact force in Newtons
            stiffness: Ground/shoe stiffness in N/m (typical: 40000-60000)
        
        Returns:
            Displacement in meters
        """
        displacement = force / stiffness
        return displacement
    
    def calculate_power(self, force, displacement, contact_time=0.3):
        """
        Calculate average power generated during footstep.
        
        Args:
            force: Impact force in Newtons
            displacement: Compression distance in meters
            contact_time: Duration of footstep contact in seconds
        
        Returns:
            Power in Watts
        """
        work_done = force * displacement  # Joules
        power = work_done / contact_time  # Watts
        
        # Apply piezoelectric efficiency
        harvested_power = power * self.PIEZO_EFFICIENCY * self.IMPACT_DAMPING
        
        return harvested_power
    
    def calculate_energy_per_footstep(self, force, displacement):
        """
        Calculate total energy from a single footstep.
        
        Args:
            force: Impact force in Newtons
            displacement: Compression distance in meters
        
        Returns:
            Energy in Joules
        """
        energy = force * displacement  # Joules
        harvested_energy = energy * self.PIEZO_EFFICIENCY * self.IMPACT_DAMPING
        
        return harvested_energy
    
    def calculate_total_power(self, mass_kg, footsteps_per_minute, impact_factor=1.2):
        """
        Calculate total power for continuous walking.
        
        Args:
            mass_kg: Person's mass in kg
            footsteps_per_minute: Walking pace (60-120 typical)
            impact_factor: Dynamic impact factor
        
        Returns:
            Dictionary with power statistics
        """
        force = self.calculate_impact_force(mass_kg, impact_factor)
        displacement = self.calculate_displacement(force)
        energy_per_step = self.calculate_energy_per_footstep(force, displacement)
        
        # Convert footsteps/min to footsteps/sec
        footsteps_per_sec = footsteps_per_minute / 60
        
        # Total power
        total_power = energy_per_step * footsteps_per_sec
        
        return {
            'force_N': round(force, 2),
            'displacement_mm': round(displacement * 1000, 2),
            'energy_per_step_J': round(energy_per_step, 3),
            'footsteps_per_sec': round(footsteps_per_sec, 2),
            'power_W': round(total_power, 3),
            'power_mW': round(total_power * 1000, 2),
        }
    
    def calculate_cumulative_energy(self, mass_kg, footsteps_per_minute, duration_minutes, impact_factor=1.2):
        """
        Calculate cumulative energy over time.
        
        Args:
            mass_kg: Person's mass in kg
            footsteps_per_minute: Walking pace
            duration_minutes: Duration in minutes
            impact_factor: Dynamic impact factor
        
        Returns:
            Dictionary with cumulative energy data
        """
        power_data = self.calculate_total_power(mass_kg, footsteps_per_minute, impact_factor)
        power_watts = power_data['power_W']
        
        # Calculate cumulative energy
        total_energy_joules = power_watts * (duration_minutes * 60)
        total_energy_wh = total_energy_joules / 3600
        total_energy_kwh = total_energy_wh / 1000
        
        return {
            'power_W': power_data['power_W'],
            'duration_minutes': duration_minutes,
            'total_energy_J': round(total_energy_joules, 2),
            'total_energy_Wh': round(total_energy_wh, 3),
            'total_energy_kWh': round(total_energy_kwh, 6),
            'total_footsteps': int(footsteps_per_minute * duration_minutes),
        }
    
    def generate_footstep_data(self, mass_kg, footsteps_count=30, variance=0.1):
        """
        Generate realistic footstep data with some variance.
        
        Args:
            mass_kg: Person's mass
            footsteps_count: Number of footsteps to simulate
            variance: Force variance factor (0-0.5)
        
        Returns:
            Pandas DataFrame
        """
        force_base = self.calculate_impact_force(mass_kg)
        displacement_base = self.calculate_displacement(force_base)
        
        # Add variance
        forces = np.random.normal(force_base, force_base * variance, footsteps_count)
        forces = np.abs(forces)  # Ensure positive
        
        displacements = forces / 50000
        energies = []
        powers = []
        
        for force, displacement in zip(forces, displacements):
            energy = self.calculate_energy_per_footstep(force, displacement)
            power = energy / 0.3  # 0.3 second contact time
            energies.append(energy)
            powers.append(power)
        
        df = pd.DataFrame({
            'footstep_id': range(1, footsteps_count + 1),
            'force_N': forces,
            'displacement_mm': displacements * 1000,
            'energy_J': energies,
            'power_W': powers,
            'timestamp': pd.date_range(start='2024-01-01', periods=footsteps_count, freq='500ms')
        })
        
        return df
    
    def load_footstep_data(self, csv_path):
        """
        Load footstep data from CSV file.
        
        Args:
            csv_path: Path to CSV file
        
        Returns:
            Pandas DataFrame
        """
        try:
            df = pd.read_csv(csv_path)
            return df
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return None
    
    def analyze_footstep_data(self, df):
        """
        Analyze footstep data statistics.
        
        Args:
            df: DataFrame with footstep data
        
        Returns:
            Dictionary with statistics
        """
        if df is None or 'power_W' not in df.columns:
            return None
        
        return {
            'total_footsteps': len(df),
            'avg_force_N': round(df['force_N'].mean(), 2) if 'force_N' in df.columns else 0,
            'avg_power_W': round(df['power_W'].mean(), 3),
            'max_power_W': round(df['power_W'].max(), 3),
            'min_power_W': round(df['power_W'].min(), 3),
            'total_energy_J': round(df['energy_J'].sum(), 2) if 'energy_J' in df.columns else 0,
            'avg_energy_J': round(df['energy_J'].mean(), 3) if 'energy_J' in df.columns else 0,
        }
