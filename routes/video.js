const express = require('express');
var bodyParser = require('body-parser')
const Video = require('../controllers/videoController');
const router = express.Router();
//Username set check
function checkAuth(req, res, next) {
    if (req.session.firstName) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', checkAuth, Video.hairCheck);
router.get('/video-call', checkAuth, bodyParser.json(), Video.videoCall);
router.post('/join-room', checkAuth, bodyParser.json(), Video.joinRoom);
router.post('/name-input', bodyParser.json(), Video.userNameInput);
router.post('/topicData', checkAuth, bodyParser.json(), Video.topicData);
router.post('/create-room', checkAuth, bodyParser.json(), Video.createRoom);

module.exports = router;