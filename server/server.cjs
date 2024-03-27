const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const app = express();
const { MongoClient } = require('mongodb');
const axios = require('axios');

// Set up middleware for CORS and JSON handling
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize MongoDB database connection
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

let softwareVersion = 10;

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const database = client.db('BragerLoRaWanNetwork');
        
        const accounts = database.collection('Accounts');
        if (!(await accounts.countDocuments({}))) {
            await database.createCollection('Accounts');
        }
        
        const devices = database.collection('Devices');
        if (!(await devices.countDocuments({}))) {
            await database.createCollection('Devices');
        }
        
        const gateways = database.collection('Gateways');
        if (!(await gateways.countDocuments({}))) {
            await database.createCollection('Gateways');
        }

        const accountsCount = await accounts.countDocuments({});
        const devicesCount = await devices.countDocuments({});
        const gatewaysCount = await gateways.countDocuments({});
        
        if (accountsCount === 0 && devicesCount === 0 && gatewaysCount === 0) {
            const accountsData = require('../database/BragerLoRaWanNetwork.Accounts.json');
            const devicesData = require('../database/BragerLoRaWanNetwork.Devices.json');
            const gatewaysData = require('../database/BragerLoRaWanNetwork.Gateways.json');
            
            await accounts.insertMany(accountsData);
            await devices.insertMany(devicesData);
            await gateways.insertMany(gatewaysData);
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectToDB();

// Emit device data to client function
async function emitDeviceData(socket) {
    const database = client.db('BragerLoRaWanNetwork');
    const devices = database.collection('Devices');
    const resultdevices = await devices.find({}).toArray();

    if (resultdevices.length > 0) {
        for (let doc of resultdevices) {
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

// Emit gateway data to client function
async function emitGatewayData(socket) {
    const database = client.db('BragerLoRaWanNetwork');
    const gateways = database.collection('Gateways');
    const resultgateways = await gateways.find({}).toArray();

    if (resultgateways.length > 0) {
        for (let doc of resultgateways) {
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

// Socket.IO connection handling
io.on('connection', async (socket) => {
    console.log('Nowe połączenie Socket.IO');
    
     // Emit device data to client
    emitDeviceData(socket);

    // Emit gateway data to client
    emitGatewayData(socket);

    // Handle password verification
    socket.on('password?', async (password) => {
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

    // Receive and handle device locations
    socket.on('deviceLocations', async (locations) => {
        console.log(locations);

        const database = client.db('BragerLoRaWanNetwork');
        const devices = database.collection('Devices');
    
        for (let location of locations) {
            const { deviceId, latitude, longitude } = location;
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const house_number = response.data.address.house_number ? response.data.address.house_number : '';
            const road = response.data.address.road ? response.data.address.road : '';
            const city = response.data.address.city ? response.data.address.city : '';
            const town = response.data.address.town ? response.data.address.town : '';
            const geolocationName = `${road} ${house_number} ${city} ${town}`;
    
            //Database update
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
    socket.on('updateVersion', async (version) => {
        softwareVersion = version;
        console.log(softwareVersion);
    });
});

// Endpoint to receive gateway configuration
app.post('/api/config', async (req, res) => {
    const data = req.body;
    const gatewayDevID = data.DevId;
    const gatewayGeolocation = data.Location.split(';');
    //const listaa = gatewayGeolocation.split(';')
    const gatewayGeolocationLatitude = gatewayGeolocation[0];
    const gatewayGeolocationLongitude = gatewayGeolocation[1];
    
    // Convert coordinates to address
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${gatewayGeolocationLatitude}&lon=${gatewayGeolocationLongitude}`);
    const house_number = response.data.address.house_number ? response.data.address.house_number : '';
    const road = response.data.address.road ? response.data.address.road : '';
    const city = response.data.address.city ? response.data.address.city : '';
    const town = response.data.address.town ? response.data.address.town : '';
    const geolocationName = `${road} ${house_number} ${city} ${town}`;

    const database = client.db('BragerLoRaWanNetwork');
    const gateways = database.collection('Gateways');

    const existingDevice = await gateways.findOne({ GatewayDevID: gatewayDevID });
    
    if (existingDevice) { //exists
        await gateways.updateOne(
            { GatewayDevID: gatewayDevID },
            {
                $set: {
                    geolocationName, gatewayGeolocationLatitude, gatewayGeolocationLongitude,
                }
            }
        );
        console.log(`Dane gatewaya ${ gatewayDevID } zostały zaktualizowane.`);
    } else { //does not exist
        await gateways.insertOne({
            gatewayDevID, geolocationName, gatewayGeolocationLatitude, gatewayGeolocationLongitude,
        });
        console.log(`Dane gatewaya ${ gatewayDevID } zostały dodane.`);
    }
    res.status(200).send(`${ softwareVersion }`)
    
    emitGatewayData(io);

});

// Endpoint to receive device data
app.post('/api/dane', async (req, res) => {
    const data = req.body;
    const temperature = data.T;
    const humidity = data.W;
    const devID = data.ID;
    const gatewayDevID = data.GatewayDevId;
    let time = new Date();
    time.setHours(time.getHours() + 1);
    time = time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0].split("-").reverse().join("/") + " " + time.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1]; // Formatowanie daty i czasu
    const geolocationLatitude = "undefined";
    const geolocationLongitude = "undefined";
    
        const geolocationName = devID

        const database = client.db('BragerLoRaWanNetwork');
        const devices = database.collection('Devices');

        const existingDevice = await devices.findOne({ DevID: devID });

        if (existingDevice) { //exists
            await devices.updateOne(
                { DevID: devID },
                {
                    $set: {
                        temperature, humidity, gatewayDevID, time
                    }
                }
            );
            console.log(`Dane urządzenia ${ devID } zostały zaktualizowane.`);
        } else { //does not exist
            await devices.insertOne({
                DevID: devID, temperature, humidity, geolocationName, gatewayDevID, geolocationLatitude, geolocationLongitude, time
            });
            console.log(`Dane urządzenia ${ devID } zostały dodane do bazy danych bez lokalizacji.`);
        }
        res.status(200).send(`${ softwareVersion }`)
        
        emitDeviceData(io)

});

// Start HTTP server listening on port 4001
server.listen(4001, () => {
    console.log('Serwer nasłuchuje na porcie 4001');
});