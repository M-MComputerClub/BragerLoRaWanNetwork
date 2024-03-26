<template>
  <div class="w-screen h-screen flex items-center justify-center flex-col bg-background text-white">
    <div class="bg-backgrounddiv md:w-2/3 h-5/6 w-5/6 rounded-3xl border-backgrounddiv100 border-2 flex flex-col gap-8 p-16 items-center">
      <div class="flex flex-col items-center gap-2">
        <h1 class="font-semibold text-5xl text-center">Gateway Configuration</h1>
        <h2 class="font-light text-3xl">ESP WiFi Manager</h2>
      </div>
      <form @submit.prevent="handleSubmit" class="flex flex-col w-full md:w-2/3 gap-2">
        <div class="flex flex-col">
          <label for="ssid" class="text-lg">SSID</label>
          <input type="text" id="ssid" v-model="ssid" class="text-background p-2 rounded-lg font-semibold" required>
        </div>
        <div class="flex flex-col">
          <label for="pass" class="text-lg">Password</label>
          <input type="text" id="pass" v-model="pass" class="text-background p-2 rounded-lg font-semibold" required>
        </div>
        <div class="flex flex-col">
          <label for="ip" class="text-lg">IP Address</label>
          <input type="text" id="ip" v-model="ip" class="text-background p-2 rounded-lg font-semibold" required>
        </div>
        <div class="flex flex-col">
          <label for="gateway" class="text-lg">Gateway Address</label>
          <input type="text" id="gateway" v-model="gateway" class="text-background p-2 rounded-lg font-semibold" required>
        </div>
        <div class="flex flex-col">
          <label for="gateway" class="text-lg">Location</label>
          <input type="text" id="location" v-model="location" class="text-background p-2 rounded-lg font-semibold" required>
        </div>
        <div class="flex justify-center">
          <input type="submit" value="Submit" class="bg-white text-background p-2 rounded-lg w-1/2 md:w-1/5 text-xl font-semibold m-2">
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const ssid = ref('');
const pass = ref('');
const ip = ref('255.255.255.255');
const gateway = ref('255.255.255.255');
const location = ref('0.0000 ; 0.00000');


const handleSubmit = () => {
  // Tutaj możesz dodać logikę obsługi formularza
  console.log({
    ssid: ssid.value,
    pass: pass.value,
    ip: ip.value,
    gateway: gateway.value
  });
};
</script>