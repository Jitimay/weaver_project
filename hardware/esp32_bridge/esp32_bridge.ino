#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h> // Requires ArduinoJson library

// ================= CONFIGURATION =================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const int SERVER_PORT = 80;

// Serial to Arduino (UART 2)
#define RXD2 16
#define TXD2 17
// =================================================

WebServer server(SERVER_PORT);

void setup() {
  Serial.begin(115200);
  
  // Initialize Serial2 for communication with Arduino
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP Address: ");
  Serial.println(WiFi.localIP());

  // Setup Web Server Routes
  server.on("/command", HTTP_POST, handleCommand);
  server.on("/", HTTP_GET, []() {
    server.send(200, "text/plain", "Project Weaver ESP32 Bridge Online");
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

void handleCommand() {
  if (server.hasArg("plain") == false) {
    server.send(400, "text/plain", "Body not received");
    return;
  }

  String body = server.arg("plain");
  Serial.println("Received: " + body);

  // Validate JSON (Optional but good practice)
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  // Forward to Arduino via Serial2
  // We append a newline as a delimiter
  Serial2.println(body);

  server.send(200, "application/json", "{\"status\":\"sent\"}");
}
