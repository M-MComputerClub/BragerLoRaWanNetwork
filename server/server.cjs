const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const app = express();
const { MongoClient } = require('mongodb');

// Ustawienie middleware dla CORS i obsługi JSON
app.use(cors());
app.use(express.json());

// Tworzenie serwera HTTP
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Inicjalizacja bazy danych MongoDB (przykład - użyj swojej bazy danych)
//Połączenie z bazą danych
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDB();

// Obsługa połączenia Socket.IO
// CO się dzieje gdy użytkownik aplikacji uruchomi aplikacjie
io.on('connection', async (socket) => {
    console.log('Nowe połączenie Socket.IO');
    
    const database = client.db('BragerLoRaWanNetwork');
    const devices = database.collection('Devices');
    const gateways = database.collection('Gateways');
    const result = await devices.find({}).toArray();
    if (result.length > 0) {
        
        // Iteracja przez wszystkie dokumenty z bazy danych
        for (let doc of result) {
            console.log(
                doc.DevID,
                doc.temperature,
                doc.humidity,
                doc.geolocationName,
                doc.gatewayDevID,
                doc.geolocationLatitude,
                doc.geolocationLongitude,
                doc.time
            )
            // Wysłanie danych dla każdego unikalnego DevID
            socket.emit('Dane', {
                DevID: doc.DevID,
                temperature: doc.temperature,
                humidity: doc.humidity,
                geolocationName: doc.geolocationName,
                gatewayDevID: doc.gatewayDevID,
                geolocationLatitude: doc.geolocationLatitude,
                geolocationLongitude: doc.geolocationLongitude,
                time: doc.time
            });
        }
    } else {
        console.log('Brak danych w bazie danych.');
    }
});

app.post('/api/dane', async (req, res) => {
    const data = req.body; // Pobranie danych JSON z body żądania
    const temperatura = data.T;
    const wilgotnosc = data.W;
    const szerokosc = data.X;
    const wysokosc = data.Y;
    const DevId = data.DevId;
    const GatewayDevId = data.GatewayDevId;
    const geolocationName = 'Twoja lokalizacja'; // Zastąp to rzeczywistą nazwą lokalizacji

    let time = new Date(); // Aktualna data i czas
    time.setHours(time.getHours() + 1); // Dodanie godziny
    time = time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0].split("-").reverse().join("/") + " " + time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1]; // Formatowanie daty i czasu

    const database = client.db('BragerLoRaWanNetwork');
    const devices = database.collection('Devices');

    // Sprawdzenie, czy dokument z tym DevID już istnieje
    const existingDevice = await devices.findOne({ DevID: DevId });

    if (existingDevice) {
        // Jeśli dokument istnieje, aktualizujemy go
        await devices.updateOne(
            { DevID: DevId },
            {
                $set: {
                    temperature: temperatura,
                    humidity: wilgotnosc,
                    geolocationName: geolocationName,
                    gatewayDevID: GatewayDevId,
                    geolocationLatitude: szerokosc,
                    geolocationLongitude: wysokosc,
                    time: time
                }
            }
        );
        console.log(`Dane urządzenia ${ DevId } zostały zaktualizowane.`);
    } else {
        // Jeśli dokument nie istnieje, dodajemy go
        await devices.insertOne({
            DevID: DevId,
            temperature: temperatura,
            humidity: wilgotnosc,
            geolocationName: geolocationName,
            gatewayDevID: GatewayDevId,
            geolocationLatitude: szerokosc,
            geolocationLongitude: wysokosc,
            time: time
        });
        console.log(`Dane urządzenia ${ DevId } zostały dodane.`);
    }
    res.status(200).send('Dane odebrane!')
});

app.post('/api/config', async (req, res) => {
    const data = req.body;
    const GatewayDevId = data.GatewayDevId;
    const szerokosc = data.X;
    const wysokosc = data.Y;
    const geolocationName = 'Twoja lokalizacja';
    
    const database = client.db('BragerLoRaWanNetwork');
    const gateways = database.collection('Gateways');

    // Sprawdzenie, czy dokument z tym DevID już istnieje
    const existingDevice = await gateways.findOne({ GatewayDevID: GatewayDevId });

    if (existingDevice) {
        // Jeśli dokument istnieje, aktualizujemy go
        await gateways.updateOne(
            { GatewayDevID: GatewayDevId },
            {
                $set: {
                    geolocationName: geolocationName,
                    gatewayGeolocationLatitude: szerokosc,
                    gatewayGeolocationLongitude: wysokosc,  
                }
            }
        );
        console.log(`Dane gatewaya ${ GatewayDevId } zostały zaktualizowane.`);
    } else {
        // Jeśli dokument nie istnieje, dodajemy go
        await gateways.insertOne({
            geolocationName: geolocationName,
            gatewayDevID: GatewayDevId,
            gatewayGeolocationLatitude: szerokosc,
            gatewayGeolocationLongitude: wysokosc,
        });
        console.log(`Dane gatewaya ${ GatewayDevId } zostały dodane.`);
    }
    res.status(200).send('Dane odebrane!')
})

// Serwer HTTP nasłuchuje na porcie 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});