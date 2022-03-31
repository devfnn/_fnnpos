const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../db_config/db_connect')
const util = require('util');
const { promises } = require('stream');
const session = require('express-session');
const request = require('request');
const { status } = require('express/lib/response');
const { STATUS_CODES } = require('http');

router.get('/', async function(req, res, next) {
    
    res.render('login', { title: 'LogIn !!'});
});


module.exports = router;