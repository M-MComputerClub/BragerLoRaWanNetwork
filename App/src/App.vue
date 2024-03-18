<template>
  <div class="w-screen h-screen">
    <div :class="{'w-48 h-16 m-10 p-3': !isClicked, 'w-96 h-screen m-0 rounded-r-none p-4 cursor-default': isClicked}" class="z-20 bg-background rounded-2xl cursor-pointer  fixed right-0 flex justify-start items-center transition-all duration-500 ease-in-out flex-col">
      <h1 class="text-white text-3xl font-semibold cursor-pointer" @click="toggleAdminPanel">Admin</h1>
      <div v-if="isClicked" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <button v-if="isClicked" :class="{'w-0 h-0 text-xs': !isClicked, 'w-4/5 h-16 text-lg': isClicked}" class="bg-white rounded-xl font-medium transition-all duration-500 ease-in-out">Dodaj czujnik do listy</button>
      <ul v-if="isClicked" class="sensor-list ">
        <li v-for="sensor in sensors" class="text-white font-normal text-xl">{{ sensor.name }}</li>
      </ul>
    </div>
    <div class="w-screen h-screen">
      <l-map class="z-10" v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]">
        <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
        <l-marker>
          <l-popup>
            <h1 class="text-xl font-semibold">{{ sensor.name }}</h1>
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

let uniqueDevIDs = {};
let repeatingDevIDs = {};

const isClicked = ref(false);
const toggleAdminPanel = () => {
  isClicked.value = !isClicked.value;
};

socket.on('connect', () => {
    console.log('Połączono z serwerem');
});

socket.on('Dane', (data) => {
    console.log('Otrzymano dane:', data);

    // Sprawdzenie, czy DevID jest już w obiekcie uniqueDevIDs
    if (data.DevID in uniqueDevIDs) {
        // Jeśli tak, dodajemy do obiektu repeatingDevIDs
        if (!(data.DevID in repeatingDevIDs)) {
            repeatingDevIDs[data.DevID] = [];
        }
        repeatingDevIDs[data.DevID].push(data);
    } else {
        // Jeśli nie, dodajemy do obiektu uniqueDevIDs
        uniqueDevIDs[data.DevID] = data;
    }
});

console.log(uniqueDevIDs.DevID)


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