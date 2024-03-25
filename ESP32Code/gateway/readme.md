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


