const apiModel = require('../models/apiModel');
const PythonShell = require('python-shell').PythonShell;

module.exports = class api {
    //Render api key registration page
    static async apiRegister(req, res) {
            return res.render('api/apiRegister');
        }
        //Check if an API key exists and is valid
    static async keyAuth(req, res, next) {
            const api_key = req.query.api_key || "";
            let result = await apiModel.checkKey(api_key);
            if (result.code == 1) {
                return next();
            } else {
                return res.status(400).send(result.result);
            }
        }
        //Insert new key into the DB as long as email isnt already registered
    static async createKey(req, res) {
            const email = req.body.email;
            if (!email) {
                return res.status(401).send({ msg: 'Please enter an email address.' });
            }
            let api_key = (+new Date).toString(36);
            let result = await apiModel.createKey(email, api_key);
            if (result.code == 1) {
                return res.status(200).send({ key: api_key });
            } else {
                return res.status(400).send({ msg: result.result });
            }
        }
        //Issues request to pythonn evaluate script using python shell
        //generate time stamp
        //hash timestamp to create transcript id
        //use transcript id to select stuff on front end
    static async analyiseText(req, res) {
        let transcriptSegment = req.body;
        console.log(transcriptSegment);
        const transscriptId = (+new Date).toString(36);
        var options = {
            mode: 'text',
            pythonPath: process.env.pythonEnvRoute,
            pythonOptions: ['-u'],
            scriptPath: 'python',
            args: [transcriptSegment]
        };
        try {
            PythonShell.run('evaluate.py', options, async function(err, results) {
                if (err)
                    throw err;
                let evaluationResult = await JSON.parse(results[2]);
                evaluationResult['transcriptId'] = transscriptId;
                evaluationResult['inputText'] = Object.keys(transcriptSegment);
                console.log(evaluationResult)
                return res.status(200).send(evaluationResult);
            });
        } catch (err) {
            console.log(err);
            return res.status(200).send();
        }
    }
}