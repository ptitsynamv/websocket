const WebSocketServer = require('ws').Server;
const peers = require('../global/globalVaribles').peers;
const usersOnline = require('../global/globalVaribles').usersOnline;

const wss = new WebSocketServer({port: 9400});

module.exports.chat = async function (req, res) {
    // let emailCurrent = req.user.email;
    //TODO пока id const
    let id = '5b718e10ad83fc38e7aec988';
    let userName = 'masha';

    res.sendFile(__dirname + '/chat-page.html');

    wss.on('connection', function (socket) {
        console.log('a user connected');
        peers.push(socket);
        usersOnline.push(userName);

        console.log('peers length: ', peers.length);
        console.log('userName: ', userName);


        socket.on('close', function () {
            console.log('a user closer');
            peers.exterminate(socket);
            usersOnline.exterminate(userName);
        });

        socket.on('message', function (message) {
            console.log('message: ', message);

            let event = JSON.parse(message);

            switch (event.type) {
                case 'message':
                    broadcast(id, event.message);
                    break;
                case 'type':
                    break;
            }


            //     // если человек хочет авторизироваться, проверим его данные
            //     if (event.type === 'authorize') {
            //         myF.checkUser(event.user, event.password, function (success) {
            //             // чтоб было видно в другой области видимости
            //             registered = success;
            //
            //             var returning = {type:'authorize', success: success};
            //
            //             if (success) {
            //                 // добавим к ответному событию список людей онлайн
            //                 returning.online = lpeers;
            //
            //                 // добавим самого человека в список людей онлайн
            //                 lpeers.push (event.user);
            //
            //                 // добавим ссылку на сокет в список соединений
            //                 peers.push (ws);
            //
            //                 // чтобы было видно в другой области видимости
            //                 login = event.user;
            //
            //                 //  если человек вышел
            //                 ws.on ('close', function () {
            //                     peers.exterminate(ws);
            //                     lpeers.exterminate(login);
            //                 });
            //             }
            //
            //             ws.send (JSON.stringify(returning));
            //
            //             if (success) {
            //                 myF.sendNewMessages(ws);
            //             }
            //         });
            //     } else {
            //         if (registered) {
            //             switch (event.type) {
            //                 case 'message':
            //                     // рассылаем его всем
            //                     myF.broadcast (login, event.message);
            //                     break;
            //                 case 'type':
            //                     break;
            //             }
            //         }
            //     }
        });
    });
};

function broadcast (userId, message) {
    var time = new Date().getTime();

    peers.forEach (function (ws) {
        ws.send (JSON.stringify ({
            type: 'message',
            message: message,
            from: userId,
            time: time
        }));
    });

    // сохраняем сообщение в истории
    // chatDB.insert ({message: message, from: by, time: time}, {w:1}, function (err) {
    //     if (err) {throw err}
    // });
}

// убрать из массива элемент по его значению
Array.prototype.exterminate = function (value) {
    this.splice(this.indexOf(value), 1);
};