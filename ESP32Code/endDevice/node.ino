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

#define uS_TO_S_FACTOR 1000000  /* Conversion factor for micro seconds to seconds */
#define TIME_TO_SLEEP  5        /* Time ESP32 will go to sleep (in seconds) */

RTC_DATA_ATTR int bootCount = 0;

#define DHT11_PIN 27

DHT dht(DHT11_PIN, DHT11);
//define the pins used by the transceiver module
#define ss 5
#define rst 14
#define dio0 2

const int version = 10;
bool updating = false;

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

void update(){
  updating = true;
  Serial.println("Setting AP (Access Point)");
  // NULL sets an open Access Point
  WiFi.softAP("ESP-WIFI-MANAGER", NULL);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP); 

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
  updating = false;
  
  //Increment boot number and print it every reboot
  ++bootCount;
  Serial.println("Boot number: " + String(bootCount));

  

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
  if (runEvery(5000)) { // repeat every 5000 millis

    Serial.print("Sending packet non-blocking: ");
    Serial.println(counter);

    // send in async / non-blocking mode
    LoRa.beginPacket();
    //LoRa.print("hello ");
    //LoRa.print(counter);

    // Utwórz dokument JSON do przechowywania danych czujnika
    StaticJsonDocument<200> doc;

    // Dodaj wartości czujnika jako pary klucz-wartość do dokumentu JSON
    doc["W"] = dht.readHumidity();      // Wilgotność
    doc["T"] = dht.readTemperature();   // Temperatura
    doc["DevId"] = mac2String((byte*) &chipMac);   // Temperatura
    doc["Ver"] = version;               // Pozycja

    // Przekonwertuj dokument JSON na ciąg znaków do wysłania
    String requestBody;
    serializeJson(doc, requestBody);
    Serial.println(requestBody);

    LoRa.print(requestBody);

    LoRa.endPacket(true); // true = async / non-blocking mode

    counter++;
  
    while(!runEvery(5000)){
      Serial.print("Szukam");
      int packetSize = LoRa.parsePacket();
      if (packetSize) {
        // received a packet
        Serial.print("Received packet '");

        // read packet
        while (LoRa.available()) {
          Serial.print((char)LoRa.read());
        }

        // print RSSI of packet
        Serial.print("' with RSSI ");
        Serial.println(LoRa.packetRssi());
        update();
         while(updating){}
      }
    }
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
    Serial.println("Setup ESP32 to sleep for every " + String(TIME_TO_SLEEP) +" Seconds");

    Serial.println("Going to sleep now");
    delay(1000);
    Serial.flush(); 
    esp_deep_sleep_start();
  }
}

void onTxDone() {
  Serial.println("TxDone");
}

boolean runEvery(unsigned long interval) {
  static unsigned long previousMillis = 0;
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    return true;
  }
  return false;
}