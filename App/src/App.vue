<template>
  <div class="w-screen h-screen">
    <div class="w-screen h-screen">
      <l-map class="z-10" v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]">
        <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
        <l-marker v-for="sensor in sensors" :lat-lng="[sensor.geolocationLatitude, sensor.geolocationLongitude]">
          <l-popup>
            <h1 class="text-xl font-semibold">{{ sensor.geolocationName }}</h1>
            <p class="text-base -mb-2">Temperatura: <span class="font-bold">{{ sensor.temperature }}°C</span></p>
            <p class="text-base -mb-2">Wilgotność: <span class="font-bold">{{ sensor.humidity }}%</span></p>
            <p class="text-base -mb-2">Dane odebrane o: <span class="font-bold">{{ sensor.time }}</span></p>
          </l-popup>
        </l-marker>
      </l-map> 
    </div>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";
import io from 'socket.io-client';
const socket = io('http://localhost:4001');

let zoom = 5;
let latitude = ref(null)
let longitude = ref(null)
let locationLoaded = ref(false)
let sensors = ref([])
let gateways = ref([])

socket.on('connect', () => {
    console.log('Połączono z serwerem');
});

socket.on('endDevices', (data) => {
    console.log('Otrzymano dane o urzązeniach:', data);
    sensors.value.push(data);
});

socket.on('gateways', (data) => {
    console.log('Otrzymano dane o bramkach:', data);
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

</script>