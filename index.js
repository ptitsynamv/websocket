const app = require('./app');

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


const wss = require('socket.io').listen(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

require ('./controllers/chat')(wss);
