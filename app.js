const config = require("./config/config.js");
const http = require("http");
const redis = require('mqemitter-redis');
const aedesPersistenceRedis = require("aedes-persistence-redis");


const mq = redis({
    port: config.REDIS_PORT,   // Redis port
    host: config.REDIS_HOST,   // Redis host
    db: config.REDIS_DATABASE, // Redis database (1)
    password: config.REDIS_PASSWORD, // Redis password
})


const persistence = aedesPersistenceRedis({
    port: config.REDIS_PORT,   // Redis port
    host: config.REDIS_HOST,   // Redis host
    family: 4,           // IP v4
    password: config.REDIS_PASSWORD, // Redis password
    db: config.REDIS_DATABASE, // Redis database (1)
    maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
    // eslint-disable-next-line no-unused-vars
    packetTTL: function (_packet) { // offline message TTL, default is disabled
        return 10 // in seconds
    }
})

const helloClever = http.createServer(function (req, res) {
    if (req.url == '/') { //check the URL of the current request
        
        // set response header
        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        
        // set response content    
        res.write('<html><body><p>Check-up status server => OK</p></body></html>');
        res.end();
    
    }
    else
        res.end('404 ;)');
});

const aedes = require("aedes")({
    mq,
    persistence
});

//  authenticate user / password
aedes.authenticate = function (client, username, password, callback) {
    let authorized = (username == config.MQTT_USER && password.toString() == config.MQTT_PASSWORD);
    if (authorized) client.user = username;
    callback(null, authorized);
}

// create server

const server = require('net').createServer(aedes.handle)
server.listen(config.MQTT_PORT, function () {
    console.log('start Mqtt with Redis Persistance');
})

aedes.on('clientError', function (client, err) {
    console.log('client error', client.id, err.message, err.stack)
})

aedes.on('connectionError', function (client, err) {
    console.log('client error', client, err.message, err.stack)
})

aedes.on('publish', function (packet, client) {
    if (client) {
        console.log('message from client', client.id);
    }
    switch (packet.topic) {
        case 'test':
            return console.log('test get : ' + packet.payload.toString());
    }
})

aedes.on('subscribe', function (subscriptions, client) {
    if (client) {
        console.log('subscribe from client', subscriptions, client.id);
    }
})

aedes.on('client', function (client) {
    console.log('new client: ', client.id);
})

aedes.on('clientDisconnect', function (client) {
    console.log('client disconnected: ', client.id);
})

helloClever.listen(config.PORT);
console.log('CC LB check-up status server at port ' + config.PORT +  ' is running..');
