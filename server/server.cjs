const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const app = express();
const { MongoClient } = require('mongodb');
const axios = require('axios');

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

async function emitDeviceData(socket) {
    const database = client.db('BragerLoRaWanNetwork');
    const devices = database.collection('Devices');
    const resultdevices = await devices.find({}).toArray();

    if (resultdevices.length > 0) {
        // Iteracja przez wszystkie dokumenty z bazy danych
        for (let doc of resultdevices) {
            // Wysłanie danych dla każdego unikalnego DevID
            socket.emit('endDevices', {
                DevID: doc.DevID,
                temperature: doc.temperature,
                humidity: doc.humidity,
                geolocationName: doc.geolocationName,
                gatewayDevID: doc.gatewayDevID,
                geolocationLatitude: doc.geolocationLatitude,
                geolocationLongitude: doc.geolocationLongitude,
                time: doc.time
            });
            console.log('dane o urzązeniach zostały wysłane');
        }
    } else {
        console.log('Brak danych o urzązeniach w bazie danych.');
    }
}

async function emitGatewayData(socket) {
    const database = client.db('BragerLoRaWanNetwork');
    const gateways = database.collection('Gateways');
    const resultgateways = await gateways.find({}).toArray();

    if (resultgateways.length > 0) {
        // Iteracja przez wszystkie dokumenty z bazy danych
        for (let doc of resultgateways) {
            // Wysłanie danych dla każdego unikalnego DevID
            socket.emit('gateways', {
                gatewayDevID: doc.GatewayDevID,
                geolocationName: doc.geolocationName,
                geolocationLatitude: doc.gatewayGeolocationLatitude,
                geolocationLongitude: doc.gatewayGeolocationLongitude,
            });
            console.log('dane o bramkach zostały wysłane');
        }
    } else {
        console.log('Brak danych o bramkach w bazie danych.');
    }
}

// Obsługa połączenia Socket.IO
// CO się dzieje gdy użytkownik aplikacji uruchomi aplikacjie
io.on('connection', async (socket) => {
    console.log('Nowe połączenie Socket.IO');
    
    emitDeviceData(socket);

    emitGatewayData(socket);

    //sprawdzanie hasła
    socket.on('password?', async (password) => {
        console.log("123")
        console.log('Hasło odebrane!')
        const database = client.db('BragerLoRaWanNetwork');
        const accounts = database.collection('Accounts');

        const user = await accounts.findOne({ username: 'admin' });
        console.log(user && user.password)
        
        if (user && user.password === password) {
            socket.emit('password!', true);
        } else {
            socket.emit('password!', false);
        }
    });

    socket.on('deviceLocations', async (locations) => {
        console.log(locations);

    
        const database = client.db('BragerLoRaWanNetwork');
        const devices = database.collection('Devices');
    
        // Iteracja przez każde przesłane miejsce lokalizacji
        for (let location of locations) {
            const { deviceId, latitude, longitude } = location;
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const house_number = response.data.address.house_number ? response.data.address.house_number : '';
            const road = response.data.address.road ? response.data.address.road : '';
            const city = response.data.address.city ? response.data.address.city : '';
            const town = response.data.address.town ? response.data.address.town : '';
            const geolocationName = `${road} ${house_number} ${city} ${town}`;
    
            // Aktualizacja dokumentu w bazie danych dla danego deviceId
            await devices.updateOne(
                { DevID: deviceId },
                {
                    $set: {
                        geolocationLatitude: latitude,
                        geolocationLongitude: longitude,
                        geolocationName
                    }
                }
            );
    
            console.log(`Lokalizacja urządzenia ${deviceId} została zaktualizowana w bazie danych.`);
        }
    });
});


app.post('/api/config', async (req, res) => {
    const data = req.body;
    const gatewayDevID = data.GatewayDevId;
    const gatewayGeolocationLatitude = data.X;
    const gatewayGeolocationLongitude = data.Y;
    
    // Convert coordinates to address
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${gatewayGeolocationLatitude}&lon=${gatewayGeolocationLongitude}`);
    const house_number = response.data.address.house_number ? response.data.address.house_number : '';
    const road = response.data.address.road ? response.data.address.road : '';
    const city = response.data.address.city ? response.data.address.city : '';
    const town = response.data.address.town ? response.data.address.town : '';
    const geolocationName = `${road} ${house_number} ${city} ${town}`;

    const database = client.db('BragerLoRaWanNetwork');
    const gateways = database.collection('Gateways');

    // Sprawdzenie, czy dokument z tym DevID już istnieje
    const existingDevice = await gateways.findOne({ GatewayDevID: gatewayDevID });
    
    if (existingDevice) {
        // Jeśli dokument istnieje, aktualizujemy go
        await gateways.updateOne(
            { GatewayDevID: gatewayDevID },
            {
                $set: {
                    geolocationName, gatewayGeolocationLatitude, gatewayGeolocationLongitude,
                }
            }
        );
        console.log(`Dane gatewaya ${ gatewayDevID } zostały zaktualizowane.`);
    } else {
        // Jeśli dokument nie istnieje, dodajemy go
        await gateways.insertOne({
            gatewayDevID, geolocationName, gatewayGeolocationLatitude, gatewayGeolocationLongitude,
        });
        console.log(`Dane gatewaya ${ gatewayDevID } zostały dodane.`);
    }
    res.status(200).send('Dane odebrane!')
    
    emitGatewayData(io);

});

app.post('/api/dane', async (req, res) => {
    const data = req.body; // Pobranie danych JSON z body żądania
    const temperature = data.T;
    const humidity = data.W;
    const devID = data.DevId;
    const gatewayDevID = data.GatewayDevId;
    let time = new Date(); // Aktualna data i czas
    time.setHours(time.getHours() + 1); // Dodanie godziny
    time = time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0].split("-").reverse().join("/") + " " + time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1]; // Formatowanie daty i czasu
    const geolocationLatitude = "undefined";
    const geolocationLongitude = "undefined";
    
        const geolocationName = devID

        const database = client.db('BragerLoRaWanNetwork');
        const devices = database.collection('Devices');

        const existingDevice = await devices.findOne({ DevID: devID });

        if (existingDevice) {
            // Jeśli dokument istnieje, aktualizujemy go
            await devices.updateOne(
                { DevID: devID },
                {
                    $set: {
                        temperature, humidity, gatewayDevID, time
                    }
                }
            );
            console.log(`Dane urządzenia ${ devID } zostały zaktualizowane.`);
        } else {
            // Jeśli dokument nie istnieje, dodajemy go
            await devices.insertOne({
                DevID: devID, temperature, humidity, geolocationName, gatewayDevID, geolocationLatitude, geolocationLongitude, time
            });
            console.log(`Dane urządzenia ${ devID } zostały dodane do bazy danych bez lokalizacji.`);
        }
        res.status(200).send('Dane odebrane!')
        
        emitDeviceData(io)

});



// Serwer HTTP nasłuchuje na porcie 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});