#include <DHT.h>
#include <esp_wifi.h>
/*********
  Modified from the examples of the Arduino LoRa library
  More resources: https://randomnerdtutorials.com
*********/

#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>  // Biblioteka do obsługi danych JSON

#define DHT11_PIN 27

DHT dht(DHT11_PIN, DHT11);
//define the pins used by the transceiver module
#define ss 5
#define rst 14
#define dio0 2

int counter = 0;

void setup() {
  //initialize Serial Monitor
  Serial.begin(115200);
  while (!Serial);

  //Pobieranie adresu Mac na DevID
  uint64_t chipMac,  = ESP.getEfuseMac();
  Serial.printf("\nCHIP MAC: %012llx\n", chipMac);

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
   // Change sync word (0xF3) to match the receiver
  // The sync word assures you don't get LoRa messages from other LoRa transceivers
  // ranges from 0-0xFF
  LoRa.setSyncWord(0xF3);
  LoRa.setTxPower(20);
  LoRa.setSpreadingFactor(12);
  Serial.println("LoRa Initializing OK!");
}

void loop() {
  Serial.print("Sending packet: ");
  Serial.println(counter);

  //Send LoRa packet to receiver
  LoRa.beginPacket();
  //LoRa.print("hello ");
  //LoRa.print(counter);

  // Utwórz dokument JSON do przechowywania danych czujnika
  StaticJsonDocument<200> doc;

  // Dodaj wartości czujnika jako pary klucz-wartość do dokumentu JSON
  doc["W"] = dht.readHumidity();  // Wilgotność
  doc["T"] = dht.readTemperature();     // Temperatura
  doc["X"] = 51.889056;     // Pozycja 51.889056, 17.775250
  doc["Y"] = 17.775250;     // Pozycja

  // Przekonwertuj dokument JSON na ciąg znaków do wysłania
  String requestBody;
  serializeJson(doc, requestBody);
  LoRa.print(requestBody);

  LoRa.endPacket();

  counter++;

  delay(10000);
}
