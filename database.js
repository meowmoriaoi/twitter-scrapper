const mysql = require('mysql2');

let connection;

const database = {
    connect: async (dbname) => {
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'helldancer',
            database: dbname,
            charset: 'utf8mb4'
        });
    },
    insertTweets: async (tableName, tweet) => {
        await connection.execute(
            `INSERT INTO ${tableName} (twitter_status, time_added, url) VALUES (?, ?, ?)`,
            [tweet.status, tweet.date, tweet.url]
        )
    },
    getUsers: async (dbname) => {
        return new Promise(resolve => connection.query('SHOW TABLES', (err, result) => {
            const user = result.map(table => table[`Tables_in_${dbname}`]);
            resolve(user);
        }))
    },
    getNewestTweet: async (tableName) => {
        return new Promise(resolve => connection.query(`SELECT url FROM ${tableName} ORDER BY time LIMIT 1`, (err, result) => {
            if (result != undefined) resolve(result[0]['url']);
            resolve(result);
        }))
    },
    destroy: async () => {
        await connection.end();
    }
}

module.exports = database;