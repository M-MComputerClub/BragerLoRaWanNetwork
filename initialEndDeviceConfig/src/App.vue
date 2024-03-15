<template>
  <div class="w-screen h-screen">
    <l-map v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
      <l-marker :lat-lng="[latitude.value, longitude.value]">
      </l-marker>
    </l-map> 
  </div>
</template>
<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";

let zoom = 15;
let latitude = ref(null)
let longitude = ref(null)
let locationLoaded = ref(false)

navigator.geolocation.getCurrentPosition(position => {
    latitude.value = Number(position.coords.latitude)
    longitude.value = Number(position.coords.longitude)
    locationLoaded.value = true
}, error => {
    console.log("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
});

</script>
