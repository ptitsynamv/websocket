const User = require('../models/User');
const Message = require('../models/Message');
const helpFunctions = require('../soft/helpFunctions');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

let allUsers = new Map();
let peers = new Map();


function getLastMessages(limit = 2, skip = 0, currentSocket = false) {
    let messageArray = [];
    Message
        .find({})
        .populate('user')
        .sort({date: -1})
        .limit(limit)
        .skip(skip)
        .exec(function (err, allModels) {
            if (err) {
                helpFunctions.errorSocket(currentSocket, err, 500);
            }
            allModels.forEach((value) => {
                messageArray.push({
                    userId: value.user._id,
                    userName: value.user.email,
                    comment: value.comment,
                    color: value.user.color,
                    date: value.date,
                });
            });

            emitEvent(
                'message',
                {
                    isNewMessage: false,
                    message: messageArray,
                },
                currentSocket
            );
        });
}

function emitEvent(nameEvent, message, currentSocket = false) {
    if (currentSocket) {
        currentSocket.emit(nameEvent, message);
    } else {
        peers.forEach((value) => {
            value.emit(nameEvent, message);
        });
    }
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
    emitEvent('allUsers', helpFunctions.mapToObj(allUsers));
}


module.exports = function (wss) {
    wss.on('connection', (socket) => {

        socket.on('login', (data) => {
            jwt.verify(data, keys.jwt, function (err, decodedCurrentUser) {

                if (!decodedCurrentUser) {
                    helpFunctions.errorSocket(socket, 'The tokens lifetime has expired', 401);
                    return;
                }

                peers.set(decodedCurrentUser.userId, socket);

                User.findById(decodedCurrentUser.userId, (err, currentUser) => {
                    if (err) {
                        helpFunctions.errorSocket(socket, err, 500);
                        return;
                    }
                    if (!currentUser) {
                        helpFunctions.errorSocket(socket, 'Current user is not found', 404);
                        return;
                    }
                    if (currentUser.isBan) {
                        helpFunctions.errorSocket(socket, 'Current user isBan', 403);
                        if (peers.has(decodedCurrentUser.userId)) {
                            (peers.get(decodedCurrentUser.userId)).disconnect();
                            peers.delete(decodedCurrentUser.userId);
                            return;
                        }
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
                        getLastMessages(2, 0, socket);
                    });
                });
            });
        });

        socket.on('logout', (data) => {
            let decodedCurrentUser = jwt.decode(data);

            if (!decodedCurrentUser) {
                helpFunctions.errorSocket(socket, 'The tokens lifetime has expired', 401);
                return;
            }

            peers.delete(decodedCurrentUser.userId);
            updateUsers();
        });

        socket.on('disconnect', (data) => {
            console.log('disconnect', data);
        });

        socket.on('message', (message) => {
            jwt.verify(message.sender, keys.jwt, function (err, decodedCurrentUser) {

                if (!decodedCurrentUser) {
                    helpFunctions.errorSocket(socket, 'The tokens lifetime has expired', 401);
                    return;
                }

                User.findOne({_id: decodedCurrentUser.userId}, (err, currentUser) => {
                    if (err) {
                        helpFunctions.errorSocket(socket, err, 500);
                        return;
                    }
                    if (!currentUser) {
                        helpFunctions.errorSocket(socket, 'Current user is not found', 404);
                        return;
                    }
                    if (currentUser.isMute) {
                        helpFunctions.errorSocket(socket, 'Current user is mute', 403);
                        return;
                    }


                    Message
                        .findOne({user: decodedCurrentUser.userId})
                        .sort({date: -1})
                        .exec((err, lastUsersMessage) => {
                            if (err) {
                                helpFunctions.errorSocket(socket, err, 500);
                                return;
                            }
                            if (lastUsersMessage && (Date.now() - Date.parse(lastUsersMessage.date)) / 1000 < 15) {
                                helpFunctions.errorSocket(socket, 'Last users message was send less then 15 seconds', 400);
                                return;
                            }

                            new Message({
                                user: decodedCurrentUser.userId,
                                comment: message.comment
                            }).save(err => {
                                if (err) {
                                    helpFunctions.errorSocket(socket, err, 500);
                                }
                            });

                            emitEvent('message', {
                                isNewMessage: true,
                                message: [{
                                    userId: currentUser._id,
                                    userName: currentUser.email,
                                    comment: message.comment,
                                    color: currentUser.color,
                                    date: new Date(),
                                }]
                            });
                        });
                });
            });
        });

        socket.on('mute', (message) => {
            jwt.verify(message.sender, keys.jwt, function (err, decodedCurrentUser) {

                if (!decodedCurrentUser) {
                    helpFunctions.errorSocket(socket, 'The tokens lifetime has expired', 401);
                    return;
                }
                User.findOne({_id: decodedCurrentUser.userId}, (err, currentUser) => {
                    if (err) {
                        helpFunctions.errorSocket(socket, err, 500);
                        return;
                    }
                    if (!currentUser) {
                        helpFunctions.errorSocket(socket, 'Current user is not found', 404);
                        return;
                    }
                    if (!currentUser.isAdmin) {
                        helpFunctions.errorSocket(socket, 'Current user is not admin', 403);
                        return;
                    }

                    User.findOne({_id: message.userForMuteId}, (err, userMute) => {
                        if (err) {
                            helpFunctions.errorSocket(socket, err, 500);
                            return;
                        }
                        if (!userMute) {
                            helpFunctions.errorSocket(socket, 'User not found', 404);
                            return;
                        }
                        if (userMute.isAdmin) {
                            helpFunctions.errorSocket(socket, 'User for mute is admin', 400);
                            return;
                        }

                        userMute.isMute = !userMute.isMute;
                        userMute.save((err) => {
                            if (err) {
                                helpFunctions.errorSocket(socket, err, 500);
                                return;
                            }
                            updateUsers(userMute);
                        });
                    });
                });
            });
        });

        socket.on('ban', (message) => {
            jwt.verify(message.sender, keys.jwt, function (err, decodedCurrentUser) {

                if (!decodedCurrentUser) {
                    helpFunctions.errorSocket(socket, 'The tokens lifetime has expired', 401);
                    return;
                }

                User.findOne({_id: decodedCurrentUser.userId}, (err, currentUser) => {
                    if (err) {
                        helpFunctions.errorSocket(socket, err, 500);
                        return;
                    }
                    if (!currentUser) {
                        helpFunctions.errorSocket(socket, 'Current user is not found', 404);
                        return;
                    }
                    if (!currentUser.isAdmin) {
                        helpFunctions.errorSocket(socket, 'Current user is not admin', 403);
                        return;
                    }

                    User.findOne({_id: message.userForBanId}, function (err, userBan) {
                        if (err) {
                            helpFunctions.errorSocket(socket, err, 500);
                            return;
                        }
                        if (!userBan) {
                            helpFunctions.errorSocket(socket, 'User not found', 404);
                            return;
                        }
                        if (userBan.isAdmin) {
                            helpFunctions.errorSocket(socket, 'User for ban is admin', 400);
                            return;
                        }

                        if (!userBan.isBan) {
                            if (peers.has(message.userForBanId)) {
                                (peers.get(message.userForBanId)).disconnect();
                                peers.delete(message.userForBanId);
                            }
                        }

                        userBan.isBan = !userBan.isBan;
                        userBan.save(function (err) {
                            if (err) {
                                helpFunctions.errorSocket(socket, err, 500);
                                return;
                            }
                            updateUsers(userBan);
                        });
                    });
                });
            });
        });

        socket.on('getPreviousMessage', (message) => {
            let skip = message.paginationSkip;
            let limit = message.paginationLimit;

            getLastMessages(limit, skip, socket)
        });
    })
};


