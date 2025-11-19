# Project Weaver

A kinetic art installation representing a Jira project in real-time.

## Directory Structure
- `weaver-forge-app/`: The Jira Forge application.
- `hardware/`: Firmware for ESP32 and Arduino.
- `simulation/`: Web-based simulation for testing.

## Quick Start (Simulation)
1. `cd simulation`
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000`

## Hardware Wiring Instructions
**Components**:
- Arduino Nano RP2040 or Mega
- ESP32 TTGO T-Call
- 8x Servo Motors
- 1x NEMA 17 Stepper Motor + A4988 Driver
- 1x Relay Module + Pump
- External 5V Power Supply (High Amperage)
- 12V Power Supply (for Stepper/Pump)

**Connections**:
1. **ESP32 to Arduino**:
   - ESP32 TX (GPIO 17) -> Arduino RX
   - ESP32 RX (GPIO 16) -> Arduino TX
   - GND -> GND

2. **Servos**:
   - Signal Pins -> Arduino D2 - D9
   - VCC -> External 5V
   - GND -> External GND (Shared with Arduino)

3. **Stepper (A4988)**:
   - STEP -> Arduino D10
   - DIR -> Arduino D11
   - VMOT -> 12V
   - GND -> GND
   - VDD -> 5V

4. **Relay**:
   - IN -> Arduino D12
   - VCC -> 5V
   - GND -> GND

## Forge App Setup
See `weaver-forge-app/README.md` (create this if needed) or standard Forge deployment instructions.
Update `src/index.js` with the IP address of your ESP32.
# weaver_project
