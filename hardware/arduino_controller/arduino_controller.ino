#include <Servo.h>
#include <AccelStepper.h>
#include <ArduinoJson.h> // Requires ArduinoJson library

// ================= CONFIGURATION =================
// Servos
const int NUM_SERVOS = 8;
const int SERVO_PINS[NUM_SERVOS] = {2, 3, 4, 5, 6, 7, 8, 9}; // Adjust pins as needed
Servo servos[NUM_SERVOS];

// Stepper (NEMA 17 with Driver, e.g., A4988)
#define STEP_PIN 10
#define DIR_PIN 11
AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

// Relay (Pump)
#define RELAY_PIN 12

// =================================================

void setup() {
  Serial.begin(9600); // Must match ESP32 Serial2 baud rate

  // Setup Servos
  for (int i = 0; i < NUM_SERVOS; i++) {
    servos[i].attach(SERVO_PINS[i]);
    servos[i].write(0); // Initialize to 0
  }

  // Setup Stepper
  stepper.setMaxSpeed(1000);
  stepper.setSpeed(0); // Initial speed

  // Setup Relay
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Assume LOW is OFF

  Serial.println("Arduino Controller Ready");
}

void loop() {
  // 1. Handle Serial Commands
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    processCommand(input);
  }

  // 2. Update Stepper
  stepper.runSpeed();
}

void processCommand(String json) {
  DynamicJsonDocument doc(512);
  DeserializationError error = deserializeJson(doc, json);

  if (error) {
    // Serial.print("JSON Error: "); Serial.println(error.c_str());
    return;
  }

  const char* cmd = doc["cmd"];
  int id = doc["id"];
  int val = doc["val"];

  if (strcmp(cmd, "SERVO") == 0) {
    if (id >= 0 && id < NUM_SERVOS) {
      // Constrain angle
      val = constrain(val, 0, 180);
      servos[id].write(val);
    }
  } 
  else if (strcmp(cmd, "STEPPER") == 0) {
    // Set speed
    stepper.setSpeed(val);
  } 
  else if (strcmp(cmd, "RELAY") == 0) {
    digitalWrite(RELAY_PIN, val ? HIGH : LOW);
  }
}
