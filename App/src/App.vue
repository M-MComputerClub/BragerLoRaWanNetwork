<template>
  <div class="w-screen h-screen" v-if="latitude.value && longitude.value">
    <l-map ref="map" v-model:zoom="zoom" :center="[latitude.value, longitude.value]">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
    </l-map>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";

let zoom = 15;
let latitude = ref(0)
let longitude = ref(0)

const getLocationAndShow = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            latitude.value = position.coords.latitude
            longitude.value = position.coords.longitude
        });
    } else { 
        console.log("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
    }
}

getLocationAndShow()

if(latitude.value && longitude.value){
  console.log(True)
}
</script>