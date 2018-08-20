const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth');

//sudo kill $(sudo lsof -t -i:3000)

router.post('/login', controller.login);
module.exports = router;