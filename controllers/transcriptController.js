const { session } = require('passport/lib');
const transcriptModel = require('../models/transcriptModel');
const pdfModel = require('../models/pdfModel');
const apiModel = require('../models/apiModel');
const PythonShell = require('python-shell').PythonShell;

module.exports = class Transcript {
    //returns a list of transcripts the username belongs to.
    static async transcriptList(req, res) {
        let result = await transcriptModel.getTranscriptList(req.session.firstName);
        if (result.code == 1) {
            return res.render("transcript/transcriptList", { transcripts: result.result });
        } else {
            return res.status(400).send({ msg: result.result })
        }
    }

    //Loads all transcript and room details ready to be displayed.
    //renders the transcript viewer page.
    static async viewTranscript(req, res) {
        let roomName;
        if (req.query.room_name) {
            roomName = req.query.room_name;
        } else if (req.session.roomName) {
            roomName = req.session.roomName
        } else {
            return res.redirect("/transcript/list");
        }
        req.session.roomName = roomName;
        let transcriptResult = await transcriptModel.viewTranscript(roomName)
        console.log(transcriptResult);
        let transcriptDetails = await transcriptModel.getTranscriptDetails(roomName);
        console.log(transcriptDetails);

        if (transcriptResult.code == 1 && transcriptDetails.code == 1) {
            return res.render("transcript/transcriptView", {
                transcript: transcriptResult.result,
                transcriptDetails: transcriptDetails.result[0],
                roomName: roomName,
                userName: req.session.firstName
            });
        } else if (transcriptResult.code == 2) {
            return res.status(400).send({ msg: transcriptResult.result })
        } else {
            return res.status(400).send({ msg: transcriptDetails.result })
        }
        //check for url query first,
        //if url query is not set check for session, if neither, redirect to list
    }

    //updates a transcript segement 
    //updates the rooms table to reset the PDF as not generated as the PDF will need to be regenerated since the transcript update
    static async updateTranscriptSegment(req, res) {
        const segmentKey = req.body.key || "";
        const transcriptSegment = req.body.transcriptSegment;
        const tag = req.body.tag;
        let updateResult = await transcriptModel.updateTranscriptSegment(segmentKey, transcriptSegment, tag);
        let roomResult = await pdfModel.generatedFalse(req.session.roomName);
        if (updateResult.code == 1 && roomResult.code == 1) {
            return res.status(200).send();
        } else if (updateResult.code == 2) {
            return res.status(400).send({ msg: updateResult.result })
        } else {
            return res.status(400).send({ msg: roomResult.result })
        }
    }


    // Returns a transcript segment accessed by the transcript key
    static async getTranscriptSegment(req, res) {
        const transcriptKey = req.body.key || "";
        let result = await transcriptModel.getTranscriptSegment(transcriptKey);
        if (result.code == 1) {
            return res.status(200).send(JSON.stringify(result.result));
        } else {
            return res.status(400).send({ msg: result.result })
        }
    }

    //Deletes transcript segment from database by the transcript key
    //updates the rooms table to reset the PDF as not generated
    static async deleteTranscriptSegment(req, res) {
        const transcriptKey = req.body.key || "";
        let deleteResult = await transcriptModel.deleteTranscriptSegment(transcriptKey);
        let roomResult = await pdfModel.generatedFalse(req.session.roomName);
        if (deleteResult.code == 1 && roomResult.code == 1) {
            return res.status(200).send();
        } else if (deleteResult.code == 2) {
            return res.status(400).send({ msg: deleteResult.result })
        } else {
            return res.status(400).send({ msg: roomResult.result })
        }
    }


    // Reananlyise used for issuing requests to the python script, updating the database, and returning the topic label to the user.
    static async reanalyise(req, res) {
        const segmentKey = req.body.key || "";
        let transcript;
        let transcriptID;
        let result = await transcriptModel.getTranscriptSegment(segmentKey);
        if (result.code == 1) {
            transcript = result.result[0].transcriptSegment;
            transcriptID = result.result[0].transcriptID;
        } else {
            return res.status(400).send({ msg: result.result })
        }


        var options = {
            mode: 'text',
            pythonPath: process.env.pythonEnvRoute,
            pythonOptions: ['-u'],
            scriptPath: 'python',
            args: [transcript]
        };
        //generate time stamp
        //hash timestamp to create transcript id
        //use transcript id to select stuff on front end
        try {
            PythonShell.run('evaluate.py', options, async function(err, results) {
                if (err)
                    throw err;
                let evaluationResult = await JSON.parse(results[2]);
                let updateResult = await transcriptModel.updateTranscriptSegment(transcriptID, transcript, evaluationResult.outputText);
                let roomResult = await pdfModel.generatedFalse(req.session.roomName);
                if (updateResult.code == 1 && roomResult.code == 1) {
                    return res.status(200).send(evaluationResult.outputText);
                } else if (updateResult.code == 2) {
                    return res.status(400).send({ msg: updateResult.result })
                } else {
                    return res.status(400).send({ msg: roomResult.result })
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(400).send({ msg: err });
        }
    }
}