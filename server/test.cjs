const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.post('/api/dane', async (req, res) => {
    const data = req.body; 
    console.log(data);
    res.status(200).send("10")
});

server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});