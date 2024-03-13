const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
import axios from 'axios';
app.use(cors());
app.use(express.json()); 
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  let temperatura = 0
  let wilgotnosc = 0
  let szerokosc = 0
  let wysokosc = 0
  let dataRealna = 0;
  

// Obsługa połączenia Socket.IO
io.on('connection', (socket) => {
    console.log('Nowe połączenie Socket.IO');
    io.emit('dane', temperatura, wilgotnosc, szerokosc, wysokosc);
});

app.post('/api/dane', async (req, res) => {
  const data = req.body; // Pobranie danych JSON z body żądania
  temperatura = data.T
  wilgotnosc = data.W
  szerokosc = data.X
  wysokosc = data.Y
  
  const response = await axios.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + coordinates[0] + '&lon=' + coordinates[1]);
  let house_number = response.data.address.house_number ? response.data.address.house_number + ' ' : '';
  let road = response.data.address.road ? response.data.address.road + ' ' : '';
  let town = response.data.address.town ? response.data.address.town + ' ' : '';
  let city = response.data.address.city ? response.data.address.city : '';
  address.value = road + house_number + town + city || coordinates;
  
  // Przetworzenie danych JSON
  io.emit('dane', temperatura, wilgotnosc, szerokosc, wysokosc, new Date()),address.value;
  // io.emit('Wilk', data.W);
  // io.emit('X', data.X);
  // io.emit('Y', data.Y);
  console.log(data); // Wyświetlenie danych JSON w konsoli

  res.status(200).send("Dane odebrane!"); // Wysłanie odpowiedzi
});

// Serwer HTTP nasłuchuje
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});