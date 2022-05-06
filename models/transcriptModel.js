const { session } = require('passport/lib');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.databaseUsername,
    password: process.env.databasePassword,
    database: "FP",
    connectionLimit: 5
});


module.exports = class transcriptModel {
    //Gets all transcripts from DB that the user is assigned to
    static async getTranscriptList(firstName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM Rooms WHERE memberA=(?) OR memberB=(?)", [firstName, firstName])
            conn.end();
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

    //loads all transcript data ready for viewing
    static async viewTranscript(roomName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM Transcripts WHERE RoomName = (?)", [roomName]);
            conn.end();
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

    //Gets details about the transcript from the Rooms table, like members and room detials
    static async getTranscriptDetails(roomName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM Rooms WHERE roomName = (?)", [roomName]);
            conn.end();
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

    //Update transcript segment with new key, transcript text, and new label
    static async updateTranscriptSegment(segmentKey, transcriptSegment, tag) {
        let conn;
        try {
            conn = await pool.getConnection();
            let result = await conn.query("UPDATE Transcripts SET transcriptSegment = (?), labelA = (?) WHERE transcriptId = (?)", [transcriptSegment, tag, segmentKey]);
            console.log(result);
            conn.end();
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

    //retrives transcript segment by key
    static async getTranscriptSegment(transcriptKey) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM Transcripts WHERE transcriptId = (?)", [transcriptKey]);
            console.log(result);
            conn.end();
            return {
                code: 1,
                result: result
            }
        } catch (err) {
            console.log(err);
            return {
                code: 1,
                result: err
            }
        }
    }

    //deletes transcript segment from DB by key
    static async deleteTranscriptSegment(transcriptKey) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("DELETE FROM Transcripts WHERE transcriptId = (?)", [transcriptKey]);
            console.log(result);
            conn.end();
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
        };
    }

    //Creates new transcript segment
    static async insertNewTranscriptSegment(roomName, firstName, transcriptSegment, segmentLabel, transcriptID) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("INSERT INTO Transcripts (RoomName, transcriptSegment, speakerName, labelA, transcriptID) value (?,?,?,?,?)", [roomName, transcriptSegment, firstName, segmentLabel, transcriptID]);
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