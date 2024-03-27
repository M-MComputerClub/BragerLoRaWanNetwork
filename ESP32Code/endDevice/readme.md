### Hardware connection

The code has been adapted for the ESP32-WROOM-32E with the RFM95W module. 
The end device should be flashed with the code from the node folder

```bash
  cd ESP32Code/endDevice
```
and connect the Asair temperature and humidity sensor

To ensure proper device operation, you should connect everything according to the following diagram: 

|    ESP32     |    Sensor   |  RFM95  |Antenna connector|
|--------------|-------------|---------|-----------------|
|      2       |-------------|  dio0   |-----------------|
|      5       |-------------|  NSS    |-----------------|
|     14       |-------------|  RESET  |-----------------|
|     18       |-------------|  SCK    |-----------------|
|     19       |-------------|  MISO   |-----------------|
|     23       |-------------|  MOSI   |-----------------|
|     27       |    data     |---------|-----------------|
|    3.3v      |    3.3v     |  3.3v   |-----------------|
|     GND      |    GND      |   GND   |       GND       |
|--------------|-------------|   ANA   |      DATA       |

