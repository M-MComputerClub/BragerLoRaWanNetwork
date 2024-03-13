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

// Wywołuj funkcję pobierzDane co 5 minut
setInterval(pobierzDane, 10 * 1000);

// Obsługa połączenia Socket.IO
io.on('connection', (socket) => {
    console.log('Nowe połączenie Socket.IO');
});

app.post('/api/dane', (req, res) => {
  const data = req.body; // Pobranie danych JSON z body żądania

  // Przetworzenie danych JSON
  io.emit('dane', data);
  console.log(data); // Wyświetlenie danych JSON w konsoli

  res.status(200).send("Dane odebrane!"); // Wysłanie odpowiedzi
});

// Serwer HTTP nasłuchuje
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});