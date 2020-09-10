const twitter = require('./twitter');
const database = require('./database');

(async () => {
    const users = ['cucuhajinaim', '_ulrul'];

    for (user of users) {
        try {
            await database.connect('belajar');
            await twitter.initialize(`https://twitter.com/${user}`);

            let totalTweets = await twitter.getTotalTweets();

            while (totalTweets) {
                const post = await twitter.getUserData();

                if (post.username == user) {
                    await database.insert('samuel', post)
                }

                totalTweets--;
            }
        } catch (error) {
            await twitter.end();
            await database.destroy();
        }
    }
})();