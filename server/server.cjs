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
    const collection = database.collection('Devices');
    const result = await collection.find({}).toArray();
    if (result.length > 0) {
        console.log('Wszystkie dane z bazy danych:');
        console.log(result);
        
        // Iteracja przez wszystkie dokumenty z bazy danych
        for (let doc of result) {
            console.log(
                doc.gatewayDevID,
                doc.DevID,
                doc.geolocationLatitude,
                doc.geolocationLongitude,
                doc.geolocationName,
                doc.temperature,
                doc.humidity,
                doc.time
            )
            // Wysłanie danych dla każdego unikalnego DevID
            // socket.emit(doc.DevID, {
            //     gatewayDevID: doc.gatewayDevID,
            //     geolocationLatitude: doc.geolocationLatitude,
            //     geolocationLongitude: doc.geolocationLongitude,
            //     geolocationName: doc.geolocationName,
            //     temperature: doc.temperature,
            //     humidity: doc.humidity,
            //     time: doc.time
            // });
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
    const time = new Date().toISOString(); // Aktualna data i czas

    const database = client.db('BragerLoRaWanNetwork');
    const collection = database.collection('Devices');

    // Sprawdzenie, czy dokument z tym DevID już istnieje
    const existingDevice = await collection.findOne({ DevID: DevId });

    if (existingDevice) {
        // Jeśli dokument istnieje, aktualizujemy go
        await collection.updateOne(
            { DevID: DevId },
            {
                $set: {
                    gatewayDevID: GatewayDevId,
                    geolocationLatitude: szerokosc,
                    geolocationLongitude: wysokosc,
                    geolocationName: geolocationName,
                    temperature: temperatura,
                    humidity: wilgotnosc,
                    time: time
                }
            }
        );
        console.log('Dane urządzenia zostały zaktualizowane.');
    } else {
        // Jeśli dokument nie istnieje, dodajemy go
        await collection.insertOne({
            gatewayDevID: GatewayDevId,
            DevID: DevId,
            geolocationLatitude: szerokosc,
            geolocationLongitude: wysokosc,
            geolocationName: geolocationName,
            temperature: temperatura,
            humidity: wilgotnosc,
            time: time
        });
        console.log('Dane urządzenia zostały dodane.');
    }
});

// Serwer HTTP nasłuchuje na porcie 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});