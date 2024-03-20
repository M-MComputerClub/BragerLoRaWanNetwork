<template>
  <div class="w-screen h-screen">
    <div :class="{'w-48 h-16 m-10 p-3': !isClicked, 'w-96 h-screen m-0 rounded-r-none p-4 cursor-default': isClicked}" class="z-20 bg-background rounded-2xl cursor-pointer  fixed right-0 flex justify-start items-center transition-all duration-500 ease-in-out flex-col">
      <h1 class="text-white text-3xl font-semibold cursor-pointer" @click="toggleAdminPanel">Admin</h1>
      <div v-if="isClicked" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <input v-if="isClicked" type="password" v-model="passwordInput" placeholder="Wpisz hasło" @keyup.enter="checkPassword" />
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

socket.on('connect', () => {
    console.log('Połączono z serwerem');
});

socket.on('endDevices', (data) => {
    // console.log('Otrzymano dane o urzązeniach:', data);
    sensors.value.push(data);
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

  socket.on('password!', (isValid) => {
    console.log(isValid);
    if(isValid){
      console.log("Dostęp do panelu administracyjnego przyznany!");
    }else{
      console.log("Błędne hasło!")
    }
  });
};
</script>