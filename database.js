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
    insert: async (tableName, post) => {
        await connection.execute(
            `INSERT INTO ${tableName} (username, twitter_status, replies, retweets, likes, time_added, tweet_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [post.username, post.status, post.reply, post.retweet, post.like, post.date, post.url]
        )
    },
    destroy: async () => {
        await connection.destroy();
    }
}

module.exports = database;