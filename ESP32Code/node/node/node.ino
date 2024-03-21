
//Debug lib

//Debug lib

#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>  // Biblioteka do obsługi danych JSON
#include <DHT.h>
#include <esp_wifi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncElegantOTA.h>
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>

#define DHT11_PIN 27

DHT dht(DHT11_PIN, DHT11);
//define the pins used by the transceiver module
#define ss 5
#define rst 14
#define dio0 2

const char* ssid = "Trzmiel";
const char* password = "RYZIDRUB";

AsyncWebServer server(80);

int counter = 0;
int id;
uint64_t chipMac = ESP.getEfuseMac();

String mac2String(byte ar[]) {
  String s;
  for (byte i = 0; i < 6; ++i)
  {
    char buf[3];
    sprintf(buf, "%02X", ar[i]); // J-M-L: slight modification, added the 0 in the format for padding 
    s += buf;
   // if (i < 5) s += '';
  }
  return s;
}

void elozelo(){
    WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
while (WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.print(".");
}
Serial.println("");
Serial.print("Connected to ");
Serial.println(ssid);
Serial.print("IP address: ");
Serial.println(WiFi.localIP());

server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
  request->send(200, "text/plain", "Hi! I am ESP32.");
});

AsyncElegantOTA.begin(&server);    // Start ElegantOTA
  server.begin();
  Serial.println("HTTP server started");


}

void setup() {
  //initialize Serial Monitor
  Serial.begin(115200);
 elozelo();
 while (!Serial);
  Serial.println("LoRa Sender");

  //setup LoRa transceiver module
  LoRa.setPins(ss, rst, dio0);
  dht.begin(); 

  //replace the LoRa.begin(---E-) argument with your location's frequency 
  //433E6 for Asia
  //866E6 for Europe
  //915E6 for North America
  while (!LoRa.begin(866E6)) {
    Serial.println(".");
    delay(500);
  }
  //
  //Serial.printf("\nCHIP MAC: %012llx\n", chipMac);
   // Change sync word (0xF3) to match the receiver
  // The sync word assures you don't get LoRa messages from other LoRa transceivers
  // ranges from 0-0xFF
  LoRa.setSyncWord(0xF3);
  LoRa.setTxPower(20);
  LoRa.setSpreadingFactor(12);
  delay(2000);
  Serial.println("LoRa Initializing OK!");
}

void loop() {
  Serial.print("Sending packet: ");

  //Send LoRa packet to receiver
  LoRa.beginPacket();
  //LoRa.print("hello ");
  //LoRa.print(counter);

  // Utwórz dokument JSON do przechowywania danych czujnika
  StaticJsonDocument<200> doc;

  // Dodaj wartości czujnika jako pary klucz-wartość do dokumentu JSON
  doc["W"] = dht.readHumidity();      // Wilgotność
  doc["T"] = dht.readTemperature();   // Temperatura
  //Serial.println(mac2String((byte*) &chipMac));
  doc["ID"] = mac2String((byte*) &chipMac);   // Temperatura
  doc["X"] = 51.889056;               // Pozycja 51.889056, 17.775250
  doc["Y"] = 17.775250;               // Pozycja

  // Przekonwertuj dokument JSON na ciąg znaków do wysłania
  String requestBody;
  serializeJson(doc, requestBody);
  LoRa.print(requestBody);

  LoRa.endPacket();

  counter++;

  delay(10000);
}