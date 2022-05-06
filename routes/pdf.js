const express = require('express');
var bodyParser = require('body-parser')
const PDF = require('../controllers/pdfGenerator');
const router = express.Router();
//Username set check
function checkAuth(req, res, next) {
    if (req.session.firstName) {
        next();
    } else {
        res.redirect("/");
    }
}

router.post('/generate', checkAuth, PDF.generatePDF);
router.get('/download', checkAuth, PDF.downloadPDF);
router.post('/generate_wordcloud', checkAuth, PDF.generateWordCloud);
router.get('/download_wordcloud', checkAuth, PDF.downloadWordCloud);


module.exports = router;