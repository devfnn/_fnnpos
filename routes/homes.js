const express = require('express');
const moment = require('moment');
const router = express.Router();
const db = require('../db_config/db_connect')
const util = require('util');
const { promises } = require('stream');
const session = require('express-session');
const request = require('request')
const bodyParser = require('body-parser')

router.get('/', function(req, res, next) {
  res.render('homes', { title: 'homes'});
});

module.exports = router;