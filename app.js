const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');


const keys = require('./config/keys');
const authRoutes = require('./routes/auth');
const authChat = require('./routes/chat');


const app = express();


mongoose.connect(keys.mongoUrl,  { useNewUrlParser: true } )
    .then(() => console.log('mongo db connected'))
    .catch(error => console.log(error));


app.use(passport.initialize());
require('./soft/passport')(passport);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use('/api/chat', authChat);


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});




module.exports = app;