const express = require('express');
var bodyParser = require('body-parser')
const api = require('../controllers/apiController');
const router = express.Router();

//No username auth check, instead api uses keyAuth to authenticate request.
router.get('/', api.apiRegister);
router.post('/create-key', bodyParser.json(), api.createKey);
router.post('/topic-api', api.keyAuth, express.text(), api.analyiseText);

module.exports = router;