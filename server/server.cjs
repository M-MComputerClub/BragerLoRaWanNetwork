const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
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

app.post('/api/dane', (req, res) => {
  const data = req.body; // Pobranie danych JSON z body żądania
  temperatura = data.T
  wilgotnosc = data.W
  szerokosc = data.X
  wysokosc = data.Y
  // Przetworzenie danych JSON
  io.emit('dane', temperatura, wilgotnosc, szerokosc, wysokosc, new Date());
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