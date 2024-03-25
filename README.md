
# Brager LoRaWan Network for AirSenso sensor

The project is focused on implementing communication between AirSenso sensors from the [Brager](https://www.brager.pl) company and a server using LoRa technology.

We have developed software for the ESP32 with the RFM95W module, which communicates with a LoRaWan gateway. This gateway also operates on an ESP32 with an RFM95W module and communicates with a server. The server stores data in a MongoDB database and updates it in a web application written in Vue.js.



![Logo](img/bragerLogo.png)


## Screenshots

#### Desktop
![Desktop Admin panel close](img/desktopAdminClose.png)

![Desktop Admin panel open](img/desktopAdminOpen.png)

#### Mobile
![Mobile Admin panel close](img/mobileAdminClose.png)

![Mobile Admin panel open](img/mobileAdminOpen.png)
## Tech Stack

**Client:** Vue.js, Vite.js, TailwindCSS, Leaflet.js, OpenStreetMaps, SocketIo-client

<img align="left" alt="Vue" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg" />
<img align="left" alt="Vite" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" />
<img align="left" alt="TailwindCSS" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" />
<img align="left" alt="SocketIO" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/socketio/socketio-original.svg" />
<img align="left" alt="Leaflet" width="30px" style="padding-right:10px;" src="https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/096/thumb/leaflet.png" />
<img align="left" alt="OpenStreetMaps" width="30px" style="padding-right:10px;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Openstreetmap_logo.svg/1024px-Openstreetmap_logo.svg.png" />
<br />
<br />

**Server:** Node.js, Express, Axios, MongoDB, SocketIo

<img align="left" alt="Nodejs" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" />
<img align="left" alt="Express" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" />
<img align="left" alt="Axios" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/axios/axios-plain.svg" />
<img align="left" alt="MongoDB" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" />
<br />
<br />

**Tests:** CypressIo


<img align="left" alt="CypressIO" width="30px" style="padding-right:10px;" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cypressio/cypressio-original.svg" />

<br />
<br />

**Hardware:** ESP32 Espressif Wroom, RFM95W LoRa module

<img align="left" alt="Espressif" width="30px" style="padding-right:10px;" src="https://seeklogo.com/images/E/espressif-systems-logo-1350B9E771-seeklogo.com.png" />
<img align="left" alt="LoRa" width="30px" style="padding-right:10px;" src="https://res.cloudinary.com/rs-designspark-live/image/upload/c_limit,w_829/f_auto/v1/article/iot-lora-alliance-logo.svg__25c0b67804da088ad2fd64e8a76b1a3f1ceac250" />
<img align="left" alt="LoRaWan" width="30px" style="padding-right:10px;" src="https://en.iotvega.com/content/ru/site/technologies/lorawan_logo.png?v2" />
<br />
<br />

## Run Locally

Clone the project

```bash
  git clone https://github.com/M-MComputerClub/BragerLoRaWanNetwork
```

Go to the project directory

```bash
  cd BragerLoRaWanNetwork
```

### Website App

Go to the website app directory

```bash
  cd App
```

Install dependencies

```bash
  npm install
```

Run app

```bash
  npm run dev
```

Now go to http://localhost:5173/

Password for the administration panel: **admin**

### Server

Go to the server directory

```bash
  cd server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node server.cjs
```

### Devices simulator in python

Go to the gateway directory

```bash
  cd ESP32Code/gateway
```

Start the simulation

```bash
  python ./GatewaySimulator.py
```
## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## Authors

- [Mateusz Trzmiel](https://github.com/TRZMlEL)
- [Maciej Matysiak](https://github.com/ItsMaciek)
- [Maksymilian Zwierz](https://github.com/Zwierzu2115)

