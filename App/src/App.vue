<template>
  <div class="w-screen h-screen">
    <l-map ref="map" v-model:zoom="zoom" :center="[51.5350, 17.4708]">
      <l-tile-layer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" layer-type="base" name="OpenStreetMap"></l-tile-layer>
    </l-map>
  </div>
</template>

<script setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";

let zoom = 15;
</script>