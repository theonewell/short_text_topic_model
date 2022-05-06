const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.databaseUsername,
    password: process.env.databasePassword,
    database: "FP",
    connectionLimit: 5
});

module.exports = class videoModel {
    // Creates new video calling room and sets memberA to username
    static async createRoom(roomName, firstName) {
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query("INSERT INTO Rooms (`roomName`, `memberA`) value (?, ?)", [roomName, firstName]);
                console.log(result);
                return {
                    code: 1,
                    result: result
                }
            } catch (err) {
                console.log(err);
                if (err.errno == 1062) {
                    return {
                        code: 2,
                        result: 'Room already exists'
                    }
                }
                return {
                    code: 2,
                    result: err
                }
            }

        }
        //Joints new room by updating Rooms table and setting memeberB to username
    static async joinRoom(roomName, firstName) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("UPDATE Rooms SET memberB = (?) WHERE roomName = (?)", [firstName, roomName]);
            if (result.affectedRows == 0) {
                conn.end();
                return {
                    code: 2,
                    result: 'Room does not exists'
                }
            }
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
};