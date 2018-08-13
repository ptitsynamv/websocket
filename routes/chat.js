const express = require('express');
const router = express.Router();
const controller = require('../controllers/chat');



router.get('/',
//TODO пока отключила авторизацию
//passport.authenticate('jwt', {session: false}),

    controller.chat
);

module.exports = router;