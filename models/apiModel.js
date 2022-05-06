const request = require('request');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: process.env.databaseUsername,
    password: process.env.databasePassword,
    database: "FP",
    connectionLimit: 5
});

module.exports = class apiModel {
    //Database check to see if key exists
    static async checkKey(api_key) {
            console.log('hi');
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query("SELECT * FROM api_keys WHERE `api_key` = (?)", [api_key]);
                console.log(result);
                return {
                    code: 1,
                    result: result
                };
            } catch (err) {
                console.log(err);
                return {
                    code: 2,
                    result: err
                };
            }
        }
        //creates new api key using the users email
        //checks that email isnt already in use
    static async createKey(email, api_key) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query("INSERT INTO api_keys (`account_email`, `api_key`) value (?,?)", [email, api_key]);
            console.log(result);
            conn.end();
            return {
                code: 1,
                result: result
            };
        } catch (err) {
            console.log(err);
            if (err.errno == 1062) {
                return {
                    code: 2,
                    result: 'Email already in use'
                }
            }
            return {
                code: 2,
                result: err
            }
        }
    }
};