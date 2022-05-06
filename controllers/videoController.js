const { session } = require('passport/lib');
const twilio = require('twilio');
const videoModel = require('../models/videoModel');
const transcriptModel = require('../models/transcriptModel');
const PythonShell = require('python-shell').PythonShell;

module.exports = class Video {

    //render the hair check page
    static async hairCheck(req, res) {
            return res.render("video/hairCheck", { roomName: req.session.roomName });
        }
        //Generate a twilio token and render the video call page
    static async videoCall(req, res) {
        const AccessToken = twilio.jwt.AccessToken;
        const identity = req.session.firstName;
        const token = new AccessToken(
            process.env.twilioAccountSid,
            process.env.twilioApiKey,
            process.env.twilioApiSecret, { identity: identity }
        );
        const VideoGrant = AccessToken.VideoGrant;
        const videoGrant = new VideoGrant();
        token.addGrant(videoGrant);
        res.render("video/videoCall", { token: token.toJwt(), roomName: req.session.roomName });
    }

    //take the name input from the haircheck page and set it as a session 
    static async userNameInput(req, res) {
        console.log(process.env)
        const firstName = req.body.userName;
        if (!firstName) {
            return res.status(401).send({ msg: 'Please enter a name' });
        }
        req.session.firstName = firstName;
        return res.status(200).send();
    }

    //Creates new room by inputted name;
    static async createRoom(req, res) {
        const roomName = req.body.roomName;
        if (!roomName) {
            return res.status(401).send({ msg: 'Please enter a room name' });
        }
        let result = await videoModel.createRoom(roomName, req.session.firstName);
        if (result.code == 1) {
            req.session.roomName = roomName;
            req.session.role = 'memberA';
            return res.status(200).send();
        } else {
            return res.status(400).send({ msg: result.result })
        }
    }

    //Adds a user to a room, requests viewMode.joinRoom which updates the DB with the username
    static async joinRoom(req, res) {
        const roomName = req.body.roomName || "";
        if (!roomName) {
            return res.status(401).send({ msg: 'Please enter a room name' });
        }
        let result = await videoModel.joinRoom(roomName, req.session.firstName);
        if (result.code == 1) {
            req.session.roomName = roomName;
            req.session.role = 'memberB';
            return res.status(200).send();
        } else {
            return res.status(400).send({ msg: result.result })
        }
    }

    // used for issuing requests to the python script, inserting new transcript into the database, and returning the topic label to the user.
    static async topicData(req, res) {
        let transcriptSegment = req.body.transcript || "";
        const transscriptId = (+new Date).toString(36);
        console.log(transcriptSegment);
        var options = {
            mode: 'text',
            pythonPath: process.env.pythonEnvRoute,
            pythonOptions: ['-u'],
            scriptPath: 'python',
            args: [transcriptSegment]
        };
        //generate time stamp
        //hash timestamp to create transcript id
        //use transcript id to select stuff on front end
        try {
            PythonShell.run('evaluate.py', options, async function(err, results) {
                if (err)
                    throw err;
                let evaluationResult = await JSON.parse(results[2]);
                evaluationResult['transcriptId'] = transscriptId;
                let result = await transcriptModel.insertNewTranscriptSegment(
                    req.session.roomName,
                    req.session.firstName,
                    transcriptSegment,
                    evaluationResult.outputText,
                    transscriptId
                )
                if (result.code == 1) {
                    return res.status(200).send();
                } else {
                    return res.status(400).send({ msg: result.result })
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(400).send({ msg: err });
        }
    }
}