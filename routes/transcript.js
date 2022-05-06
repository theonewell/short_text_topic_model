const express = require('express');
var bodyParser = require('body-parser')
const Transcript = require('../controllers/transcriptController');
const router = express.Router();
//Username set check
function checkAuth(req, res, next) {
    if (req.session.firstName) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get('/', checkAuth, Transcript.transcriptList);
router.get('/view', checkAuth, Transcript.viewTranscript);
router.post('/get-transcript-segment', checkAuth, bodyParser.json(), Transcript.getTranscriptSegment);
router.post('/update-transcript-segment', checkAuth, bodyParser.json(), Transcript.updateTranscriptSegment);
router.post('/delete-transcript-segment', checkAuth, bodyParser.json(), Transcript.deleteTranscriptSegment);
router.post('/reanalyise-transcript-segment', checkAuth, bodyParser.json(), Transcript.reanalyise);

module.exports = router;