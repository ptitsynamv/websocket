const User = require('./models/User');


// функция отправки сообщения всем
module.exports.broadcast  = function broadcast (by, message) {

    // запишем в переменную, чтоб не расходилось время
    var time = new Date().getTime();

    // отправляем по каждому соединению
    peers.forEach (function (ws) {
        ws.send (JSON.stringify ({
            type: 'message',
            message: message,
            from: by,
            time: time
        }));
    });

    // сохраняем сообщение в истории
    chatDB.insert ({message: message, from: by, time: time}, {w:1}, function (err) {
        if (err) {throw err}
    });
};


// проверка пользователя на предмет существования в базе данных
let existUser = function existUser (user, callback) {
   return User.findOne({name: user}) ? true : false;
};


module.exports.existUser = existUser;

// эта функция отвечает целиком за всю систему аккаунтов
module.exports.checkUser = function checkUser (user, password, callback) {
    // проверяем, есть ли такой пользователь
    existUser(user, function (exist) {
        // если пользователь существует
        if (exist) {
            // то найдем в БД записи о нем
            userListDB.find({login: user}).toArray(function (error, list) {
                // проверяем пароль
                callback (list.pop().password === password);
            });
        } else {
            // если пользователя нет, то регистрируем его
            userListDB.insert ({login: user, password: password}, {w:1}, function (err) {
                if (err) {throw err}
            });
            // не запрашиваем авторизацию, пускаем сразу
            callback (true);
        }
    });
};

// список участников чата (их логины)
var lpeers = [];

// функция отправки старых сообщений новому участнику чата
module.exports.sendNewMessages = function sendNewMessages (ws) {
    chatDB.find().toArray(function(error, entries) {
        if (error) {throw error}
        entries.forEach(function (entry){
            entry.type = 'message';
            ws.send (JSON.stringify (entry));
        });
    });
};

