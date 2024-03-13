<template>
  <div class="w-screen h-screen">
    <l-map v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
      <l-marker :lat-lng="[lat, lon]">
        <l-popup>
          <h1>Nazwa tutaj</h1>
          <p>Temperatura: {{ temperature }}°C</p>
          <p>Wilgotność: {{ humidyty }}%</p>
          <p>Dane odebrane o: {{ time }}</p>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup} from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";
import io from 'socket.io-client';
const socket = io('http://localhost:4001');

let zoom = 15;
let latitude = ref(null)
let longitude = ref(null)
let locationLoaded = ref(false)
let lat = ref(null)
let lon = ref(null)
let temperature = ref(null)
let humidyty = ref(null)
let time = ref(null)

socket.on('dane', (temperatureVol, humidytyVol, latVol, lonVol, Data) => {
  console.log(temperatureVol, humidytyVol, latVol, lonVol, Data)
  lat.value = Number(latVol)
  lon.value = Number(lonVol)
  temperature.value = temperatureVol
  humidyty.value = humidytyVol

  let godzina = new Date(Data).getHours();
  let minuta = new Date(Data).getMinutes();
  let sekunda = new Date(Data).getSeconds();
  let dzien = new Date(Data).getDate();
  let miesiac = new Date(Data).getMonth() + 1; // Miesiące są indeksowane od 0
  let rok = new Date(Data).getFullYear();

  time.value = `${godzina}:${minuta}:${sekunda} ${dzien}/${miesiac}/${rok}`;

})

navigator.geolocation.getCurrentPosition(position => {
    latitude.value = Number(position.coords.latitude)
    longitude.value = Number(position.coords.longitude)
    locationLoaded.value = true
}, error => {
    console.log("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
});

</script>