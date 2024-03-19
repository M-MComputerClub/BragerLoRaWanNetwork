const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
// Ustawienie middleware dla CORS i obsługi JSON
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.post('/api/dane', async (req, res) => {
    const data = req.body; // Pobranie danych JSON z body żądania
    console.log(data);
    res.status(200).send('Dane odebrane!')
});
// Serwer HTTP nasłuchuje na porcie 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});