<template>
  <div class="w-screen h-screen">
    <div :class="{'w-48 h-16 m-10 p-3': !isClicked, 'w-96 h-screen m-0 rounded-r-none p-4 cursor-default': isClicked}" class="z-20 bg-background rounded-2xl cursor-pointer  fixed right-0 flex justify-start items-center transition-all duration-500 ease-in-out flex-col">
      <h1 class="text-white text-3xl font-semibold cursor-pointer" @click="toggleAdminPanel">Admin</h1>
      <div v-if="isClicked" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <input v-if="isClicked && !isValid" type="password" v-model="passwordInput" placeholder="Wpisz hasło" @keyup.enter="checkPassword" class="p-2 rounded-md text-background w-4/5"/>
      <ul v-if="isClicked && isValid" class="text-white list-outside flex flex-col gap-4" >
        <li v-for="deviceId in undefinedDevices" :key="deviceId" class="flex items-center flex-col gap-2">
          <h2 class="text-xl font-semibold">{{ deviceId }}</h2>
          <input type="text" placeholder="Szerokość geograficzna" :value="deviceLocation[deviceId] ? deviceLocation[deviceId].latitude : ''" @input="updateLatitude(deviceId, $event.target.value)" class="p-2 rounded-md text-background w-4/5"/>
          <input type="text" placeholder="Wysokość geograficzna" :value="deviceLocation[deviceId] ? deviceLocation[deviceId].longitude : ''" @input="updateLongitude(deviceId, $event.target.value)" class="p-2 rounded-md text-background w-4/5"/>
        </li>
        <button class="bg-white text-background p-2 rounded-lg" @click="sendDeviceLocations">Wyślij dane o lokalizacji tych urządzeń</button>
      </ul>
      <div v-if="isClicked && isValid" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <h2 v-if="isClicked && isValid" class="text-xl font-semibold text-white mb-2">Zaplanuj aktualizacje</h2>
      <input v-if="isClicked && isValid" type="datetime-local" class="p-2 rounded-md text-background w-1/2"/>
      <button v-if="isClicked && isValid" class="p-2 rounded-md text-background w-1/3 bg-white m-2">ZAPlanuj</button>
    </div>
    <div class="w-screen h-screen">
      <l-map class="z-10" v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]">
        <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
        <l-marker v-for="sensor in sensors" :lat-lng="[sensor.geolocationLatitude, sensor.geolocationLongitude]" :icon="yellowIcon">
          <l-popup>
            <h1 class="text-base font-semibold">AirSenso: {{ sensor.geolocationName }}</h1>
            <p class="text-sm -mb-2">Temperatura: <span class="font-bold">{{ sensor.temperature }}°C</span></p>
            <p class="text-sm -mb-2">Wilgotność: <span class="font-bold">{{ sensor.humidity }}%</span></p>
            <p class="text-sm -mb-2">Dane odebrane o: <span class="font-bold">{{ sensor.time }}</span></p>
          </l-popup>
        </l-marker>
        <l-marker v-for="gateway in gateways" :lat-lng="[gateway.geolocationLatitude, gateway.geolocationLongitude]" :icon="greenIcon">
          <l-popup>
            <h1 class="text-base font-semibold">Gateway: {{ gateway.geolocationName }}</h1>
            <p class="text-sm -mb-2">DevID: <span class="font-bold">{{ gateway.gatewayDevID }}</span></p>
          </l-popup>
        </l-marker>
        <l-circle v-for="gateway in gateways" :lat-lng="[gateway.geolocationLatitude, gateway.geolocationLongitude]" :radius="2000" color="green"></l-circle>
      </l-map> 
    </div>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup, LCircle } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";
import io from 'socket.io-client';
const socket = io('http://localhost:4001');

let zoom = 14;
let latitude = ref(null)
let longitude = ref(null)
let locationLoaded = ref(false)
let sensors = ref([])
let gateways = ref([])
let undefinedDevices = ref([]);
let addedUndefinedDevices = []; // Tablica do śledzenia dodanych urządzeń
let isValid = ref(false);
let deviceLocation = ref({});

socket.on('connect', () => {
    console.log('Połączono z serwerem');
});

socket.on('endDevices', (data) => {
    if (data.geolocationLatitude === "undefined" || data.geolocationLongitude === "undefined") {
        if (!addedUndefinedDevices.includes(data.DevID)) { // Sprawdź, czy DevID nie został jeszcze dodany
            undefinedDevices.value.push(data.DevID); // Dodaj DevID urządzenia do listy undefinedDevices
            addedUndefinedDevices.push(data.DevID); // Dodaj DevID do tablicy śledzenia
        }
    } else {
        sensors.value.push(data);
    }
});

socket.on('gateways', (data) => {
    // console.log('Otrzymano dane o bramkach:', data);
    gateways.value.push(data);
});

socket.on('disconnect', () => {
    console.log('Rozłączono z serwerem');
});

navigator.geolocation.getCurrentPosition(position => {
    latitude.value = Number(position.coords.latitude)
    longitude.value = Number(position.coords.longitude)
    locationLoaded.value = true
}, error => {
    console.log("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
});


//styl znacznika
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const yellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

//Admin panel
//przycisk animacja
let isClicked = ref(false);
let passwordInput = ref("");

const toggleAdminPanel = () => {
  isClicked.value = !isClicked.value;
};

const checkPassword = () => {
  socket.emit("password?", passwordInput.value);
  console.log("Hasło wysłane");
};

// subskrypcja na zdarzenie 'password!' jest wykonywana tylko raz
socket.on('password!', (isValidValue) => {
  if(isValidValue){
    console.log("Dostęp do panelu administracyjnego przyznany!");
    isValid.value = true;
  } else {
    console.log("Błędne hasło!")
    isValid.value = false; 
  }
});

const updateLatitude = (deviceId, value) => {
  deviceLocation.value[deviceId] = {
    ...deviceLocation.value[deviceId],
    latitude: value
  };
};

const updateLongitude = (deviceId, value) => {
  deviceLocation.value[deviceId] = {
    ...deviceLocation.value[deviceId],
    longitude: value
  };
};




const sendDeviceLocations = () => {
    const locations = Object.entries(deviceLocation.value).map(([deviceId, location]) => ({
        deviceId,
        latitude: location?.latitude, // Sprawdź, czy location istnieje
        longitude: location?.longitude // Sprawdź, czy location istnieje
    }));
    socket.emit('deviceLocations', locations);
    console.log('Dane o lokalizacji urządzeń zostały wysłane:', locations);

    // Usunięcie urządzenia z listy undefinedDevices
    locations.forEach(location => {
        const index = undefinedDevices.value.indexOf(location.deviceId);
        if (index !== -1) {
            undefinedDevices.value.splice(index, 1); // Usuń element z tablicy
        }
    });
};
</script>