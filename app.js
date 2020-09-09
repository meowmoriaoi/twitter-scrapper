const puppeteer = require('puppeteer');
const mysql = require('mysql2');

(async () => {
    const PARA_PENDENGKI = [
        'Mahalinidisini'
    ];

    for (pendengki of PARA_PENDENGKI) {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'helldancer',
            database: 'belajar',
            charset: 'utf8mb4'
        });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            await page.goto(`https://twitter.com/${pendengki}`);
            await page.waitForSelector('div[data-testid="tweet"]');

            await page.evaluate(() => window.scrollBy({
                top: document.querySelector('div[data-testid="tweet"]').parentElement.getBoundingClientRect().top,
                behavior: 'smooth'
            }));

            await page.waitForSelector('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-1tlfku8.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-aqfbo4.r-14lw9ot.r-my5ep6.r-rull8r.r-qklmqi.r-gtdqiz.r-ipm5af.r-1g40b8q > div.css-1dbjc4n.r-1loqt21.r-136ojw6 > div > div > div > div > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci > div > div');
            let totalTweets = await page.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-1tlfku8.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-aqfbo4.r-14lw9ot.r-my5ep6.r-rull8r.r-qklmqi.r-gtdqiz.r-ipm5af.r-1g40b8q > div.css-1dbjc4n.r-1loqt21.r-136ojw6 > div > div > div > div > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci > div > div', x => x.innerText);
            totalTweets = parseInt(totalTweets.replace(' Tweets', '').replace(',', ''));

            while (totalTweets) {
                await page.waitForSelector('div[data-testid="tweet"]');
                let tweetBox = await page.$('div[data-testid="tweet"]');

                let username = await tweetBox.$eval('div[dir="ltr"] > span', el => el.innerText.replace('@', ''));
                let replyCount = await tweetBox.$eval('[aria-label*="Reply"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
                let likeCount = await tweetBox.$eval('[aria-label*="Like"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
                let retweetCount = await tweetBox.$eval('[aria-label*="Retweet"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
                let postDate = await tweetBox.$eval('a[dir] > time', el => el.getAttribute('datetime'));
                let postUrl = await tweetBox.$eval('a[dir]', el => el.getAttribute('href'));

                let status = await tweetBox.evaluate(el => {
                    if (!el.querySelector('div[lang]')) return '';
                    return Array.from(el.querySelector('div[lang]').children,
                        node => {
                            if (node.getAttributeNames().length > 2) return node.getAttribute('title');
                            return node.innerText;
                        }
                    ).join('').trim();
                });

                if (username == pendengki) {
                    await connection.execute(
                        `INSERT INTO pendengki (username, twitter_status, replies, retweets, likes, time_added, tweet_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [`${username}`, `${status}`, `${replyCount}`, `${retweetCount}`, `${likeCount}`, `${postDate}`, `${postUrl}`]
                    )
                }

                let threadBox = await page.$('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1ny4l3l.r-1udh08x.r-1j3t67a.r-1vvnge1.r-o7ynqc.r-6416eg');
                if (threadBox) await threadBox.evaluate(el => el.parentElement.parentElement.remove());
                await tweetBox.evaluate(el => el.parentElement.remove());
                await tweetBox.evaluate(el => window.scrollBy(0, el.parentElement.getBoundingClientRect().height));

                await page.evaluate(() => document.querySelector('div[style^="position: absolute; width: 100%; transform: translateY("]').remove());
                await page.waitFor(300);

                totalTweets--;
            }
        } catch (error) {
            browser.close();
            connection.destroy();
        }
    }
})();