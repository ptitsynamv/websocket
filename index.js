const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const keys = require('./config/keys');
const User = require('./models/User');

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

const wss = require('socket.io').listen(server);

let onlineUsers = new Map();
let peers = [];

wss.on('connection', (socket) => {

    // socket.isAlive = true;
    //
    // socket.on('pong', () => {
    //     socket.isAlive = true;
    // });

    socket.on('login', function (data) {
        peers.push(socket);
        let decodedUser = jwt.decode(data);

        User.findById(decodedUser.userId, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is not found',
                });
                console.log('Current user  findOne error', 'Current user is not found');
                return;
            }
            updateOnlineUsers(currentUser);
        });


    });

    socket.on('logout', function (data) {
        let decodedUser = jwt.decode(data);
        onlineUsers.delete(decodedUser.userId);
        updateOnlineUsers();
    });


    socket.on('disconnect', function (data) {
        console.log('disconnect');
    });

    socket.on('message', (message) => {
        let messageOb = JSON.parse(message);
        let decodedUser = jwt.decode(messageOb.sender);

        broadcast('message', {
            comment: messageOb.comment,
            color: messageOb.color
        }, decodedUser.userId);
    });

    socket.on('mute', function (message) {
        let messageOb = JSON.parse(message);
        let decodedCurrentUser = jwt.decode(messageOb.sender);


        User.findOne({_id: decodedCurrentUser.userId, isAdmin: true}, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is not admin or not found',
                });
                console.log('Current user  findOne error', 'Current user is not admin or not found');
                return;
            }

            User.findOne({_id: messageOb.userId, isAdmin: false}, function (err, userMute) {
                if (err || !userMute) {
                    socket.emit('serverError', {
                        message: 'User for mute not found ',
                    });
                    console.log('userMute findOne error', 'User for mute not found ');
                    return;
                }
                userMute.isMute = !userMute.isMute;
                userMute.save(function (err) {
                    if (err) {
                        socket.emit('serverError', {
                            message: JSON.stringify(err),
                        });
                        console.log('userMute save error', JSON.stringify(err));
                        return;
                    }
                    updateOnlineUsers(userMute);
                });

            });

        });


    });


});

function broadcast(nameEvent, message, userId = null) {
    var time = new Date().getTime();

    peers.forEach(function (ws) {
        ws.emit(nameEvent, {
            userId,
            message,
            time,
        });
    });
}

function updateOnlineUsers(userUpdate = null) {
    if (userUpdate) {
        onlineUsers.set(userUpdate._id.toString(), {
            userId: userUpdate._id,
            email: userUpdate.email,
            isAdmin: userUpdate.isAdmin,
            isBan: userUpdate.isBan,
            isMute: userUpdate.isMute,
        });
    }
    console.log('onlineUsers', onlineUsers.keys());

    broadcast('onlineUsers', JSON.stringify(mapToObj(onlineUsers)));
}

function mapToObj(map, except = null) {
    const obj = {};
    for (let [k, v] of map) {
        if (k !== except) {
            obj[k] = v;
        }
    }
    return obj
}