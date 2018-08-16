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
const Message = require('./models/Message');

const app = express();

mongoose.connect(keys.mongoUrl)
    .then(() => console.log('mongo db connected'))
    .catch(error => console.log(error));

app.use(passport.initialize());
require('./soft/passport')(passport);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);


const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


const wss = require('socket.io').listen(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

let allUsers = new Map();
let peers = new Map();

wss.on('connection', (socket) => {

    socket.on('login', function (data) {
        let decodedCurrentUser = jwt.decode(data);

        if (!decodedCurrentUser) {
            socket.emit('serverError', {
                message: 'the tokens lifetime has expired',
            });
            console.log('the tokens lifetime has expired');
            return;
        }

        peers.set(decodedCurrentUser.userId, socket);

        User.findById(decodedCurrentUser.userId, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is not found',
                });
                console.log('Current user  findOne error', 'Current user is not found');
                return;
            }
            if (currentUser.isBan) {
                socket.emit('serverError', {
                    message: 'Current user isBan',
                });
                (peers.get(decodedCurrentUser.userId)).disconnect();
                peers.delete(decodedCurrentUser.userId);
                console.log('Current user isBan');
                return;
            }

            User.find({}, (err, allModels) => {
                allModels.forEach((value) => {
                    allUsers.set(value._id.toString(), {
                        id: value._id,
                        email: value.email,
                        isAdmin: value.isAdmin,
                        isBan: value.isBan,
                        isMute: value.isMute,
                    });
                });
                updateUsers();
                getLastMessages();
            });
        });
    });

    socket.on('logout', function (data) {
        let decodedCurrentUser = jwt.decode(data);

        if (!decodedCurrentUser) {
            socket.emit('serverError', {
                message: 'the tokens lifetime has expired',
            });
            console.log('the tokens lifetime has expired');
            return;
        }

        peers.delete(decodedCurrentUser.userId);
        updateUsers();
    });

    socket.on('disconnect', function (data) {
        console.log('disconnect', data);
    });

    socket.on('message', (message) => {
        let decodedCurrentUser = jwt.decode(message.token);

        if (!decodedCurrentUser) {
            socket.emit('serverError', {
                message: 'the tokens lifetime has expired',
            });
            console.log('the tokens lifetime has expired');
            return;
        }

        User.findOne({_id: decodedCurrentUser.userId, isMute: false}, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is Mute or not found',
                });
                console.log('Current user  findOne error', 'Current user is Mute or not found');
                return;
            }

            new Message({
                user: decodedCurrentUser.userId,
                comment: message.comment
            }).save(err => {
                if (err) {
                    socket.emit('serverError', {
                        message: 'Error on save Message ' + JSON.stringify(err),
                    });
                    console.log('Error on save Message ' + JSON.stringify(err));
                }
            });

            broadcast('message', [{
                userId: currentUser._id,
                userName: currentUser.email,
                comment: message.comment,
                color: currentUser.color,
                date: Date.now(),
            }]);
        });
    });

    socket.on('mute', function (message) {
        let decodedCurrentUser = jwt.decode(message.sender);

        if (!decodedCurrentUser) {
            socket.emit('serverError', {
                message: 'the tokens lifetime has expired',
            });
            console.log('the tokens lifetime has expired');
            return;
        }

        User.findOne({_id: decodedCurrentUser.userId, isAdmin: true}, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is not admin or not found',
                });
                console.log('Current user  findOne error', 'Current user is not admin or not found');
                return;
            }

            User.findOne({_id: message.userForMuteId, isAdmin: false}, (err, userMute) => {
                if (err || !userMute) {
                    socket.emit('serverError', {
                        message: 'User for mute not found ',
                    });
                    console.log('userMute findOne error', 'User for mute not found ');
                    return;
                }
                userMute.isMute = !userMute.isMute;
                userMute.save((err) => {
                    if (err) {
                        socket.emit('serverError', {
                            message: JSON.stringify(err),
                        });
                        console.log('userMute save error', JSON.stringify(err));
                        return;
                    }
                    updateUsers(userMute);
                });
            });
        });
    });

    socket.on('ban', function (message) {
        let decodedCurrentUser = jwt.decode(message.sender);

        if (!decodedCurrentUser) {
            socket.emit('serverError', {
                message: 'the tokens lifetime has expired',
            });
            console.log('the tokens lifetime has expired');
            return;
        }

        User.findOne({_id: decodedCurrentUser.userId, isAdmin: true}, (err, currentUser) => {
            if (err || !currentUser) {
                socket.emit('serverError', {
                    message: 'Current user is not admin or not found',
                });
                console.log('Current user  findOne error', 'Current user is not admin or not found');
                return;
            }

            User.findOne({_id: message.userForBanId, isAdmin: false}, function (err, userBan) {
                if (err || !userBan) {
                    socket.emit('serverError', {
                        message: 'User for ban not found ',
                    });
                    console.log('userBan findOne error', 'User for ban not found ');
                    return;
                }
                if (!userBan.isBan) {
                    (peers.get(message.userForBanId)).disconnect();
                    peers.delete(message.userForBanId);
                }

                userBan.isBan = !userBan.isBan;
                userBan.save(function (err) {
                    if (err) {
                        socket.emit('serverError', {
                            message: JSON.stringify(err),
                        });
                        console.log('userBan save error', JSON.stringify(err));
                        return;
                    }
                    updateUsers(userBan);
                });
            });
        });
    });

    socket.on('getPreviousMessage', (message) => {
        let skip = message.paginationSkip;
        let limit = message.paginationLimit;

        getLastMessages(limit, skip)
    });
});

function getLastMessages(limit = 2, skip = 0) {
    let messageArray = [];
    Message
        .find({})
        .populate('user')
        .sort({date: -1})
        .limit(limit)
        .skip(skip)
        .exec(function (err, allModels) {
            if (err)
                //TODO error notification
                return handleError(err);
            allModels.forEach((value) => {
                messageArray.push({
                    userId: value.user._id,
                    userName: value.user.email,
                    comment: value.comment,
                    color: value.user.color,
                    date: value.date,
                });
            });
            broadcast('message', messageArray);
        });

}

function broadcast(nameEvent, message) {
    peers.forEach((value) => {
        value.emit(nameEvent, message);
    });
}

function updateUsers(userUpdate = null) {
    if (userUpdate) {
        allUsers.set(userUpdate._id.toString(), {
            id: userUpdate._id,
            email: userUpdate.email,
            isAdmin: userUpdate.isAdmin,
            isBan: userUpdate.isBan,
            isMute: userUpdate.isMute,
        });
    }
    allUsers.forEach((value, key, map) => {
        allUsers.get(key).isOnline = peers.has(key);
    });

    broadcast('allUsers', mapToObj(allUsers));
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