const { session } = require('passport/lib');
var pdf = require("pdf-creator-node");
const fs = require("fs");
const pdfModel = require('../models/pdfModel');
const request = require('request');



module.exports = class PDF {
    //generate pdf printout of a rooms transcript
    static async generatePDF(req, res) {
        try {
            var html = fs.readFileSync("views/PDF/transcript.html", "utf8");
            var options = {
                format: "A3",
                orientation: "portrait",
                border: "10mm",
                header: {
                    height: "45mm",
                    contents: '<div style="text-align: center;">' + req.session.roomName + '</div>'
                },
                footer: {
                    height: "28mm",
                    contents: {
                        first: 'Cover page',
                        2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                        last: 'Last Page'
                    }
                }
            };
            //Get all transcript etires from the DB where room name matches current session roomname
            var transcript = await pdfModel.getTranscript(req.session.roomName);
            console.log(transcript);
            var document = {
                html: html,
                data: {
                    segment: transcript,
                    roomName: req.session.roomName
                },

                path: "exported_pdf/Transcript/" + req.session.roomName + ".pdf",
                type: "",
            };

            pdf
                .create(document, options)
                .then((res) => {
                    console.log(res);
                })
                .catch((error) => {
                    console.error(error);
                });
            //Changed generated to true In rooms table
            let result = await pdfModel.generatedTrue(req.session.roomName, 'pdfGenerated');
            if (result.code == 1) {
                return res.status(200).send();
            } else {
                return res.status(400).send({ msg: result.result })
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send({ msg: err })
        }
    }
    static async downloadPDF(req, res) {
            res.download("exported_pdf/Transcript/" + req.query.room_name + ".pdf")
        }
        //Generate a word cloud based on the keywords of an etire transcript.
        //Image is returned as base64 data and has to be saved to a png avalible for download
    static async generateWordCloud(req, res) {
        let tagResult = await pdfModel.getTranscriptTags(req.session.roomName);
        if (tagResult.code == 2) {
            return res.status(400).send({ msg: tagResult.result })
        }
        let words = tagResult.result.map(e => e.labelA).join(" ");
        console.log(words);
        try {
            const options = {
                method: 'POST',
                url: 'https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Host': 'textvis-word-cloud-v1.p.rapidapi.com',
                    'X-RapidAPI-Key': '40350cbe23msh1ab81c612b94841p12cc48jsnbd097378ae6e',
                    useQueryString: true
                },
                body: {
                    text: words,
                    scale: 3,
                    width: 400,
                    height: 400,
                    colors: ['#375E97', '#FB6542', '#FFBB00', '#3F681C'],
                    font: 'Tahoma',
                    use_stopwords: false,
                    language: 'en'
                },
                json: true
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                var base64Data = body.replace('data:image/png;base64,', "");

                fs.writeFile("exported_pdf/WordCloud/" + req.session.roomName + ".png", base64Data, 'base64', function(err) {
                    console.log(err);
                });
            });
            let result = await pdfModel.generatedTrue(req.session.roomName, 'wordCloudGenerated');
            if (result.code == 1) {
                return res.status(200).send();
            } else {
                return res.status(400).send({ msg: result.result })
            }
        } catch (err) {
            console.log(err);
            return res.status(400).send({ msg: err })
        }
    }
    static async downloadWordCloud(req, res) {
        res.download("exported_pdf/WordCloud/" + req.query.room_name + ".png")
    }
}