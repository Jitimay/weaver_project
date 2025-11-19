#!/bin/bash
echo "Sending test commands to Project Weaver Simulation..."

# Servo 0 to 90 degrees (In Progress)
echo "Moving Servo 0 to 90 degrees..."
curl -s -X POST -H "Content-Type: application/json" -d '{"cmd": "SERVO", "id": 0, "val": 90}' http://localhost:3000/command
echo ""
sleep 1

# Servo 1 to 180 degrees (Done)
echo "Moving Servo 1 to 180 degrees..."
curl -s -X POST -H "Content-Type: application/json" -d '{"cmd": "SERVO", "id": 1, "val": 180}' http://localhost:3000/command
echo ""
sleep 1

# Stepper Speed Up (Heartbeat)
echo "Setting Stepper Speed to 100..."
curl -s -X POST -H "Content-Type: application/json" -d '{"cmd": "STEPPER", "id": 0, "val": 100}' http://localhost:3000/command
echo ""
sleep 1

# Relay On (Critical Alert)
echo "Turning Relay ON..."
curl -s -X POST -H "Content-Type: application/json" -d '{"cmd": "RELAY", "id": 0, "val": 1}' http://localhost:3000/command
echo ""
sleep 2

# Relay Off
echo "Turning Relay OFF..."
curl -s -X POST -H "Content-Type: application/json" -d '{"cmd": "RELAY", "id": 0, "val": 0}' http://localhost:3000/command
echo ""

echo "Done! Check the simulation in your browser."
