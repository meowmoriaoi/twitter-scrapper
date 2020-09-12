const mysql = require('mysql2');
const database = require('./database');

// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'helldancer',
//     database: 'belajar',
//     charset: 'utf8mb4'
// });

// async function dbQuery(sql) {
//     return new Promise(resolve => {
//         connection.query(sql, (err, result) => {
//             const tables = result.map(table => table['Tables_in_belajar'])
//             resolve(tables)
//         })
//     })
// }

// function getData() {
//     return await dbQuery('show tables')
// }

(async () => {
    await database.connect('fanbase_idol');
    const pusing = await database.getUsers('fanbase_idol');
    const last = await database.getNewestTweet('duhmbohwes')
    console.log(pusing)
    console.log(last)
    debugger
})()