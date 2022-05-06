//js
const { session } = require('passport/lib');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.databaseUsername,
    password: process.env.databasePassword,
    database: "FP",
    connectionLimit: 5
});



module.exports = class pdfModel {
    //gets full transcript from DB by roomName
    static async getTranscript(roomName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM Transcripts WHERE RoomName = (?)", [roomName]);
            conn.end();
            console.log(result);
            return (result);
        } catch (err) {
            console.log(err);
            return (err);
        }
    }

    //gets all topic labels from transcript by roomName
    static async getTranscriptTags(roomName) {
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query("SELECT labelA FROM Transcripts WHERE RoomName = (?)", [roomName]);
                conn.end();
                console.log(result);
                return {
                    code: 1,
                    result: result
                }
            } catch (err) {
                console.log(err);
                return {
                    code: 2,
                    result: err
                }
            }
        }
        //Updates room and sets generated to true for either PDF or WordCloud
    static async generatedTrue(roomName, type) {
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query("UPDATE Rooms SET " + type + " = TRUE WHERE roomName = (?)", [roomName]);
                conn.end();
                console.log(result);
                return {
                    code: 1,
                    result: result
                }
            } catch (err) {
                console.log(err);
                return {
                    code: 2,
                    result: err
                }
            }
        }
        //updates transcript and sets generated to false for both PDF and wordcloud
    static async generatedFalse(roomName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("UPDATE Rooms SET pdfGenerated = FALSE, wordCloudGenerated = FALSE WHERE roomName = (?)", [roomName]);
            conn.end();
            console.log(result);
            return {
                code: 1,
                result: result
            }
        } catch (err) {
            console.log(err);
            return {
                code: 2,
                result: err
            }
        }
    }
};