# Project Weaver - Complete Setup Guide

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Jira      │      │  Forge App   │      │   ESP32     │      │   Arduino    │
│   Cloud     │─────▶│  (Node.js)   │─────▶│   Bridge    │─────▶│  Controller  │
│             │      │              │      │  (WiFi)     │      │              │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
    Events              HTTP POST           HTTP/MQTT            Serial JSON
  (Webhooks)           (Commands)          (Network)             (UART)
                                                                       │
                                                                       ▼
                                                          ┌──────────────────────┐
                                                          │  Physical Hardware   │
                                                          │  • 8 Servos          │
                                                          │  • 1 Stepper Motor   │
                                                          │  • 1 Relay + Pump    │
                                                          └──────────────────────┘
```

## Step-by-Step Setup

### 1️⃣ Set Up the Forge App (Cloud Layer)

The Forge app runs in Atlassian's cloud infrastructure and listens to Jira events.

#### Prerequisites
- Atlassian account with Jira access
- Node.js v18+ installed
- Forge CLI installed: `npm install -g @forge/cli`

#### Installation Steps

```bash
# Navigate to the Forge app directory
cd weaver-forge-app

# Install dependencies
npm install

# Login to Forge
forge login

# Register the app
forge register

# Deploy the app
forge deploy

# Install to your Jira site
forge install
# When prompted, select your Jira site
```

#### Configuration

Edit `weaver-forge-app/src/index.js` and update the ESP32 URL:

```javascript
const ESP32_URL = 'http://YOUR_ESP32_PUBLIC_IP:80/command';
```

**Important**: The ESP32 must be accessible from the internet for the Forge app to reach it. Options:
- **Option A**: Use port forwarding on your router to expose ESP32
- **Option B**: Use a tunneling service (ngrok, cloudflared)
- **Option C**: Use MQTT broker (see Alternative Setup below)

### 2️⃣ Set Up the ESP32 Bridge (Network Layer)

The ESP32 acts as a WiFi-to-Serial bridge, receiving HTTP commands from the cloud and forwarding them to Arduino.

#### Hardware Required
- ESP32 TTGO T-Call (or any ESP32 board)
- USB cable for programming

#### Flashing the ESP32

1. Open Arduino IDE
2. Install ESP32 board support:
   - Go to **File → Preferences**
   - Add to **Additional Board Manager URLs**: 
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to **Tools → Board → Board Manager**
   - Search for "esp32" and install

3. Install required library:
   - Go to **Sketch → Include Library → Manage Libraries**
   - Search for "ArduinoJson" and install (version 6.x)

4. Open `hardware/esp32_bridge/esp32_bridge.ino`

5. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

6. Select board: **Tools → Board → ESP32 Dev Module**

7. Select port: **Tools → Port → [Your ESP32 Port]**

8. Click **Upload**

9. Open **Serial Monitor** (115200 baud) to see the IP address

#### Wiring: ESP32 to Arduino
- ESP32 **GPIO 17 (TX2)** → Arduino **RX** (or Pin 0)
- ESP32 **GPIO 16 (RX2)** → Arduino **TX** (or Pin 1)
- ESP32 **GND** → Arduino **GND**

### 3️⃣ Set Up the Arduino Controller (Hardware Layer)

The Arduino receives Serial commands from ESP32 and controls the physical hardware.

#### Hardware Required
- Arduino Nano RP2040 or Arduino Mega
- 8× Servo Motors (SG90 or similar)
- 1× NEMA 17 Stepper Motor + A4988 Driver
- 1× Relay Module (5V)
- 1× Water Pump (optional, for demo)
- External Power Supply (5V/3A minimum for servos)
- External Power Supply (12V for stepper motor)

#### Flashing the Arduino

1. Open Arduino IDE

2. Install required libraries:
   - **Servo** (built-in)
   - **AccelStepper**: Library Manager → Search "AccelStepper" → Install
   - **ArduinoJson**: Already installed from ESP32 setup

3. Open `hardware/arduino_controller/arduino_controller.ino`

4. Select your board:
   - For **Arduino Nano RP2040**: Tools → Board → Arduino Mbed OS Nano Boards → Nano RP2040 Connect
   - For **Arduino Mega**: Tools → Board → Arduino AVR Boards → Arduino Mega

5. Select port and click **Upload**

#### Wiring: Arduino to Hardware

**Servos (8 total)**:
```
Servo 0  → Arduino Pin D2
Servo 1  → Arduino Pin D3
Servo 2  → Arduino Pin D4
Servo 3  → Arduino Pin D5
Servo 4  → Arduino Pin D6
Servo 5  → Arduino Pin D7
Servo 6  → Arduino Pin D8
Servo 7  → Arduino Pin D9

All Servo VCC → External 5V Power Supply (+)
All Servo GND → External 5V Power Supply (-) AND Arduino GND (common ground)
```

**Stepper Motor (via A4988 Driver)**:
```
A4988 STEP  → Arduino Pin D10
A4988 DIR   → Arduino Pin D11
A4988 VMOT  → 12V Power Supply (+)
A4988 GND   → 12V Power Supply (-) AND Arduino GND
A4988 VDD   → 5V (from Arduino or external)
A4988 1A/1B/2A/2B → NEMA 17 Motor Coils
```

**Relay Module**:
```
Relay IN    → Arduino Pin D12
Relay VCC   → 5V (Arduino or external)
Relay GND   → Arduino GND
Relay COM   → Pump Power (+) or 12V
Relay NO    → Pump (other wire goes to GND)
```

### 4️⃣ Testing the System

#### Test 1: Arduino Only (Hardware Test)
Send Serial commands manually via Arduino Serial Monitor (9600 baud):

```json
{"cmd": "SERVO", "id": 0, "val": 90}
{"cmd": "STEPPER", "id": 0, "val": 50}
{"cmd": "RELAY", "id": 0, "val": 1}
```

You should see servos move, stepper spin, and relay click.

#### Test 2: ESP32 + Arduino (Bridge Test)
Send HTTP POST to ESP32:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"cmd": "SERVO", "id": 0, "val": 90}' \
  http://ESP32_IP_ADDRESS/command
```

#### Test 3: Full System (Jira Integration)
1. Go to your Jira project
2. Create a new issue or transition an existing one:
   - Move issue from "To Do" → "In Progress"
3. Watch the corresponding servo move to 90°!

### 5️⃣ Simulation Mode (No Hardware Required)

If you don't have hardware yet, use the simulation:

```bash
cd simulation
npm install
npm start
```

Open http://localhost:3000 in your browser.

Update Forge app to point to: `http://localhost:3000/command` (if running simulation locally, you'll need ngrok or similar to expose it).

## Alternative Setup: Using MQTT (Recommended for Production)

Instead of direct HTTP, use an MQTT broker for more reliable cloud-to-device communication.

### MQTT Broker Options
- **HiveMQ Cloud** (free tier): https://www.hivemq.com/mqtt-cloud-broker/
- **Mosquitto** (self-hosted)

### Changes Required

**ESP32**: Replace WebServer with MQTT client (PubSubClient library)
**Forge App**: Publish to MQTT topic instead of HTTP POST

This eliminates the need for port forwarding!

## Troubleshooting

### Forge App Can't Reach ESP32
- ✅ Check ESP32 is on public IP or using ngrok
- ✅ Check firewall rules
- ✅ Consider using MQTT instead

### Servos Not Moving
- ✅ Check external 5V power supply is connected
- ✅ Verify common ground between Arduino and power supply
- ✅ Test with Serial Monitor first

### Stepper Not Spinning
- ✅ Check A4988 wiring (especially DIR and STEP pins)
- ✅ Verify 12V supply is connected to VMOT
- ✅ Adjust A4988 potentiometer for current limit
- ✅ Check motor coil connections (use multimeter)

### No Serial Communication Between ESP32 and Arduino
- ✅ Verify TX/RX are not swapped
- ✅ Check baud rates match (9600)
- ✅ Ensure common ground

## Next Steps

1. ✅ Deploy Forge app to Jira
2. ✅ Flash ESP32 and get IP address
3. ✅ Flash Arduino
4. ✅ Wire hardware carefully
5. ✅ Test layer by layer (Arduino → ESP32 → Forge)
6. 🎨 Mount hardware on kinetic sculpture frame
7. 📹 Add ESP32-CAM for live streaming (optional)

## System Behavior

| Jira Event | Hardware Response |
|------------|-------------------|
| Issue → "To Do" | Servo moves to 0° (down) |
| Issue → "In Progress" | Servo moves to 90° (middle) |
| Issue → "Done" | Servo moves to 180° (up) |
| Issue → "Blocked" | Servo moves to 45° (alert position) |
| High Priority Issue Created | Relay activates pump for 5 seconds |
| Any Issue Activity | Stepper speed increases temporarily |

## Customization

Want to change the behavior? Edit `weaver-forge-app/src/index.js`:

- **Change servo angles**: Modify `STATUS_ANGLES` object
- **Add more servos**: Update `TOTAL_SERVOS` constant
- **Change relay logic**: Modify `CRITICAL_PRIORITIES` array
- **Adjust stepper speed**: Change the `val` parameter in STEPPER command

---

**Need help?** Check the code comments in each file for detailed explanations!
