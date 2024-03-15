/*********
  Modified from the examples of the Arduino LoRa library
  More resources: https://randomnerdtutorials.com
*********/

#include <SPI.h>
#include <LoRa.h>


#include <HTTPClient.h>   // Biblioteka do wysyłania żądań HTTP
#include <WiFiMulti.h>    // Biblioteka do zarządzania wieloma połączeniami Wi-Fi

//define the pins used by the transceiver module
#define ss 5
#define rst 14
#define dio0 2

const char* AP_SSID = "Trzmiel";  // Zamień na nazwę swojej sieci Wi-Fi
const char* AP_PWD = "RYZIDRUB";         // Zamień na hasło do swojej sieci Wi-Fi

WiFiMulti wifiMulti;

void setup() {
  //initialize Serial Monitor
  Serial.begin(115200);
  while (!Serial);
  Serial.println("LoRa Receiver");

  //setup LoRa transceiver module
  LoRa.setPins(ss, rst, dio0);

  wifiMulti.addAP(AP_SSID, AP_PWD);  // Dodaj siec Wi-Fi

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
  // Połącz się z siecią Wi-Fi
  if (wifiMulti.run() == WL_CONNECTED) {
    int packetSize = LoRa.parsePacket();
    if (packetSize) {
      // received a packet
      Serial.print("Received packet '");

      // read packet
      while (LoRa.available()) {
        String LoRaData = LoRa.readString();
        //Serial.print(LoRaData);
        Uplod2Server(LoRaData);
      }

      // print RSSI of packet
      Serial.print("' with RSSI ");
      Serial.println(LoRa.packetRssi());
    }
  } else {
    Serial.println("Nie połączono z siecią Wi-Fi");
  }
  // try to parse packet
}


void Uplod2Server(String Data) {
  HTTPClient http;

  // Ustaw adres URL i port serwera (zamień na dane swojego serwera)
  http.begin("http://192.168.148.144:4001/api/dane");

  // Ustaw nagłówek typu treści, aby wskazać dane JSON
  http.addHeader("Content-Type", "application/json");

  // Wyślij żądanie HTTP POST z danymi JSON
  int httpResponseCode = http.POST(Data);

  if (httpResponseCode > 0) {
    // Odczytaj odpowiedź z serwera (jeśli istnieje)
    String response = http.getString();
    Serial.println(httpResponseCode);
    Serial.println(response);
  } else {
    Serial.println("Błąd podczas wysyłania danych JSON");
  }
}
