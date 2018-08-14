const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat');
const passport = require('passport');

//TODO пока отключила авторизацию
//sudo kill $(sudo lsof -t -i:3000)

router.get('/',
    //passport.authenticate('jwt', {session: false}),
    controller.chat
);

module.exports = router;