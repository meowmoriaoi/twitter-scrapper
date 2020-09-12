const twitter = require('./twitter');
const database = require('./database');

(async () => {
    const dbname = 'fanbase_idol';
    await database.connect(dbname);

    const users = await database.getUsers(dbname);

    for (user of users) {
        try {
            await twitter.initialize(`https://twitter.com/${user}`);

            let totalTweets = await twitter.getTotalTweets();

            while (totalTweets) {
                const newestTweet = await database.getNewestTweet(user);
                const post = await twitter.getUserData();

                if (post.username == user && post.url == newestTweet) break;

                if (post.username == user) {
                    await database.insertTweets(user, post)
                };

                totalTweets--;
            }
        } catch (error) {
            await twitter.end();
        }
    }

    await database.destroy();

})();