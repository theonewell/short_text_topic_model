const express = require('express');
const { session } = require('passport/lib');
var bodyParser = require('body-parser')
const router = express.Router();

//Username set check
function checkAuth(req, res, next) {
    if (req.session.firstName) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', (req, res) => {
    res.render("master/index", { username: req.session.firstName });
})
router.get('/join-room', checkAuth, (req, res) => {
    res.render("master/joinRoom", {});
})

module.exports = router;