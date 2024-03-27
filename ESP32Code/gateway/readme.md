


# Brager LoRaWan Network for AirSenso sensor

![Logo](img/bragerLogo.png) 

## Screenshots

![Gateway Config Panel on Desktop](/img/gatewayConfig.png)

## Tech Stack

**Hardware:** ESP32 Espressif Wroom, RFM95W LoRa module

<img align="left" alt="Espressif" width="30px" style="padding-right:10px;" src="https://seeklogo.com/images/E/espressif-systems-logo-1350B9E771-seeklogo.com.png" />
<img align="left" alt="LoRa" width="30px" style="padding-right:10px;" src="https://res.cloudinary.com/rs-designspark-live/image/upload/c_limit,w_829/f_auto/v1/article/iot-lora-alliance-logo.svg__25c0b67804da088ad2fd64e8a76b1a3f1ceac250" />
<img align="left" alt="LoRaWan" width="30px" style="padding-right:10px;" src="https://en.iotvega.com/content/ru/site/technologies/lorawan_logo.png?v2" />
<br />
<br />

### Hardware connection

The code has been adapted for the ESP32-WROOM-32E with the RFM95W module. The gateway should be flashed with the code from the gateway folder. 

```bash
  cd ESP32Code/gateway
```
To ensure proper device operation, you should connect everything according to the following diagram: 

|    ESP32     |  RFM95  |Antenna connector|
|--------------|---------|-----------------|
|      2       |  dio0   |-----------------|
|      5       |  NSS    |-----------------|
|     14       |  RESET  |-----------------|
|     18       |  SCK    |-----------------|
|     19       |  MISO   |-----------------|
|     23       |  MOSI   |-----------------|
|    3.3v      |  3.3v   |-----------------|
|     GND      |   GND   |       GND       |
|--------------|   ANA   |      DATA       |

## Authors

- [Mateusz Trzmiel](https://github.com/TRZMlEL)
- [Maciej Matysiak](https://github.com/ItsMaciek)
- [Maksymilian Zwierz](https://github.com/Zwierzu2115)

