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

// Obsługa połączenia Socket.IO
// CO się dzieje gdy użytkownik aplikacji uruchomi aplikacjie
io.on('connection', async (socket) => {
    console.log('Nowe połączenie Socket.IO');
    
    const database = client.db('BragerLoRaWanNetwork');
    const devices = database.collection('Devices');
    const gateways = database.collection('Gateways');
    const resultdevices = await devices.find({}).toArray();
    const resultgateways = await gateways.find({}).toArray();
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
        }

    } else {console.log('Brak danych o urzązeniach w bazie danych.');}

    if (resultgateways.length > 0) {

        for (let doc of resultgateways) {
            // Wysłanie danych dla każdego unikalnego DevID
            socket.emit('gateways', {  
                gatewayDevID: doc.GatewayDevID,
                geolocationName: doc.geolocationName,
                geolocationLatitude: doc.gatewayGeolocationLatitude,
                geolocationLongitude: doc.gatewayGeolocationLongitude,
            });

        }
    }else {console.log('Brak danych o bramkach w bazie danych.');}

    app.post('/api/dane', async (req, res) => {
        const data = req.body; // Pobranie danych JSON z body żądania
        const temperatura = data.T;
        const wilgotnosc = data.W;
        const szerokosc = data.X;
        const wysokosc = data.Y;
        const DevId = data.DevId;
        const GatewayDevId = data.GatewayDevId;
    
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${szerokosc}&lon=${wysokosc}`);
        const house_number = response.data.address.house_number ? response.data.address.house_number : '';
        const road = response.data.address.road ? response.data.address.road : '';
        const city = response.data.address.city ? response.data.address.city : '';
        const town = response.data.address.town ? response.data.address.town : '';
        const geolocationName = `${road} ${house_number} ${city} ${town}`;
    
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
                
            }
            console.log('dane o urzązeniach zostały wysłane')
    
        } else {console.log('Brak danych o urzązeniach w bazie danych.');}
    });
    
    app.post('/api/config', async (req, res) => {
        const data = req.body;
        const GatewayDevId = data.GatewayDevId;
        const szerokosc = data.X;
        const wysokosc = data.Y;
        
        // Convert coordinates to address
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${szerokosc}&lon=${wysokosc}`);
        const house_number = response.data.address.house_number ? response.data.address.house_number : '';
        const road = response.data.address.road ? response.data.address.road : '';
        const city = response.data.address.city ? response.data.address.city : '';
        const town = response.data.address.town ? response.data.address.town : '';
        const geolocationName = `${road} ${house_number} ${city} ${town}`;
    
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
                GatewayDevID: GatewayDevId,
                geolocationName: geolocationName,
                gatewayGeolocationLatitude: szerokosc,
                gatewayGeolocationLongitude: wysokosc,
            });
            console.log(`Dane gatewaya ${ GatewayDevId } zostały dodane.`);
        }
        res.status(200).send('Dane odebrane!')
    
        const resultgateways = await gateways.find({}).toArray();
        if (resultgateways.length > 0) {
    
            for (let doc of resultgateways) {
                // Wysłanie danych dla każdego unikalnego DevID
                socket.emit('gateways', {  
                    gatewayDevID: doc.GatewayDevID,
                    geolocationName: doc.geolocationName,
                    geolocationLatitude: doc.gatewayGeolocationLatitude,
                    geolocationLongitude: doc.gatewayGeolocationLongitude,
                });
                
            }
            console.log('dane o bramkach zostały wysłane')
        }else {console.log('Brak danych o bramkach w bazie danych.');}
    });

    //sprawdzanie hasła
    socket.on('password?', async (password) => {
        console.log('Hasło odebrane!')
        const accounts = database.collection('Accounts');
    
        const user = await accounts.findOne({ username: 'admin' });
        console.log(user && user.password)
        
        if (user && user.password === password) {
            socket.emit('password!', true);
        } else {
            socket.emit('password!', false);
        }
    });
});



// Serwer HTTP nasłuchuje na porcie 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});