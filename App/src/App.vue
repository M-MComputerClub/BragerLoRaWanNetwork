<template>
  <div class="w-screen h-screen">
    <div :class="{'w-48 h-16 m-5 md:m-10 p-3 cursor-pointer': !isClicked, 'md:w-96 w-full h-1/2 md:h-screen m-0 md:rounded-r-none rounded-b-none p-4 cursor-default overflow-y-auto overflow-x-hidden': isClicked}" class="z-20 bg-background rounded-2xl fixed bottom-0 md:bottom-auto right-0 flex justify-start items-center transition-all duration-500 ease-in-out flex-col">
      <h1 class="text-white text-3xl font-semibold cursor-pointer hover:text-color" @click="toggleAdminPanel">Admin</h1>
      <div v-if="isClicked" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <div class="flex gap-2">
        <input v-if="isClicked && !isValid" type="password" v-model="passwordInput" placeholder="Wpisz hasło" @keyup.enter="checkPassword" class="p-2 rounded-md text-background w-4/5 "/>
        <button v-if="isClicked && !isValid" class="bg-white text-background p-2 rounded-lg font-semibold hover:bg-color hover:text-white" @click="checkPassword">Enter</button>
      </div>
      <ul v-if="isClicked && isValid && undefinedDevices.length > 0" class="text-white list-outside flex flex-col gap-4" >
        <li v-for="deviceId in undefinedDevices" :key="deviceId" class="flex items-center flex-col gap-2">
          <h2 class="text-xl font-semibold">{{ deviceId }}</h2>
          <div class="flex gap-2">
            <button class="bg-white text-background p-2 rounded-md flex items-center justify-center w-1/6 hover:bg-color hover:text-white" @click="selectMarker(deviceId)">
              <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" class="w-1/2" />
            </button>
            <div class="gap-2 flex flex-col">
              <input type="text" placeholder="Szerokość geograficzna" :value="deviceLocation[deviceId]?.latitude || ''" @input="updateLatitude(deviceId, $event.target.value)" class="p-2 rounded-md text-background w-full"/>
              <input type="text" placeholder="Wysokość geograficzna" :value="deviceLocation[deviceId]?.longitude || ''" @input="updateLongitude(deviceId, $event.target.value)" class="p-2 rounded-md text-background w-full"/>
            </div>
          </div>
        </li>
        <button class="bg-white text-background p-2 rounded-lg hover:bg-color hover:text-white" @click="sendDeviceLocations">Wyślij dane o lokalizacji tych urządzeń</button>
      </ul>
      <div v-if="isClicked && isValid && undefinedDevices.length > 0" :class="{'w-0': !isClicked, 'w-full': isClicked}" class="h-1 bg-white m-5 rounded-full transition-all duration-500 ease-in-out"></div>
      <h2 v-if="isClicked && isValid" class="text-xl font-semibold text-white mb-2">Zaplanuj aktualizacje</h2>
      <input v-if="isClicked && isValid" type="datetime-local" class="p-2 rounded-md text-background w-1/2"/>
      <button v-if="isClicked && isValid" class="p-2 rounded-md text-background w-1/3 bg-white m-2 hover:bg-color hover:text-white">ZAPlanuj</button>
    </div>
    <div class="w-screen h-screen">
      <l-map class="z-10" v-if="locationLoaded" ref="map" v-model:zoom="zoom" :center="[latitude, longitude]" @click="handleMapClick">
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
let latitude = ref(null);
let longitude = ref(null);
let locationLoaded = ref(false);
let sensors = ref([]);
let gateways = ref([]);
let undefinedDevices = ref([]);
let addedUndefinedDevices = [];
let isValid = ref(false);
let deviceLocation = ref({});
let selectedDeviceId = ref(null);
let isClicked = ref(false);
let passwordInput = ref("");

socket.on('connect', () => {});

socket.on('endDevices', (data) => {
    if (data.geolocationLatitude === "undefined" || data.geolocationLongitude === "undefined") {
      if (!addedUndefinedDevices.includes(data.DevID)) {
        undefinedDevices.value.push(data.DevID);
        addedUndefinedDevices.push(data.DevID);
      }
    } else {
      sensors.value.push(data);
    }
});

socket.on('gateways', (data) => {
    gateways.value.push(data);
});

socket.on('disconnect', () => {});

navigator.geolocation.getCurrentPosition(position => {
  latitude.value = Number(position.coords.latitude);
  longitude.value = Number(position.coords.longitude);
  locationLoaded.value = true;
}, error => {
  zoom = 5;
  latitude.value = 51.4100;
  longitude.value = 19.7051;
  locationLoaded.value = true;
});

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

const handleMapClick = (event) => {
  if (selectedDeviceId.value !== null) {
    const { lat, lng } = event.latlng;
    deviceLocation.value[selectedDeviceId.value] = {
      latitude: lat,
      longitude: lng
    };
    selectedDeviceId.value = null;
  }
};

const toggleAdminPanel = () => {
  isClicked.value = !isClicked.value;
};

const checkPassword = () => {
  socket.emit("password?", passwordInput.value);
};

socket.on('password!', (isValidValue) => {
  if(isValidValue){
    isValid.value = true;
  } else {
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

const selectMarker = (deviceId) => {
  selectedDeviceId.value = deviceId;
};

const sendDeviceLocations = () => {
  const locations = Object.entries(deviceLocation.value).map(([deviceId, location]) => ({
    deviceId,
    latitude: location?.latitude,
    longitude: location?.longitude
  }));
  socket.emit('deviceLocations', locations);

  locations.forEach(location => {
    const index = undefinedDevices.value.indexOf(location.deviceId);
    if (index !== -1) {
      undefinedDevices.value.splice(index, 1);
    }
  });
};
</script>