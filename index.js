const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const keys = require('./config/keys');

const app = express();
mongoose.connect(keys.mongoUrl)
    .then(() => console.log('mongo db connected'))
    .catch(error => console.log(error));

app.use(passport.initialize());
require('./soft/passport')(passport);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);


//start our server
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});

//const server = http.createServer(app);
//const wss = new WebSocket.Server({server});

var wss = require('socket.io').listen(server);


wss.on('connection', (ws) => {

    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);

        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');

            //send back the message to the other clients
            wss.clients
                .forEach(client => {
                    if (client != ws) {
                        client.send(`Hello, broadcast message -> ${message}`);
                    }
                });

        } else {
            ws.send(`Hello, you sent -> ${message}`);
        }
    });
});

