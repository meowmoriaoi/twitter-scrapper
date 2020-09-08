const puppeteer = require('puppeteer');
const mysql = require('mysql2');

(async () => {
    const USERNAME = 'cucuhajinaim';

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'helldancer',
        database: 'belajar',
        charset: 'utf8mb4'
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://twitter.com/${USERNAME}`);
    await page.waitForSelector('div[data-testid="tweet"]')

    await page.evaluate(() => window.scrollBy({
        top: document.querySelector('div[data-testid="tweet"]').parentElement.getBoundingClientRect().top,
        behavior: 'smooth'
    }));

    let i = 0;
    while (i < 1500) {
        await page.waitForSelector('div[data-testid="tweet"]');
        let tweetBox = await page.$('div[data-testid="tweet"]');

        let username = await tweetBox.$eval('div[dir="ltr"] > span', el => el.innerText.replace('@', ''));
        let replyCount = await tweetBox.$eval('[aria-label*="Reply"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
        let likeCount = await tweetBox.$eval('[aria-label*="Like"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
        let retweetCount = await tweetBox.$eval('[aria-label*="Retweet"]', el => el.getAttribute('aria-label').match(/(\d+)\s.+/)[1]);
        let postDate = await tweetBox.$eval('a[dir] > time', el => el.getAttribute('datetime'));

        let status = await tweetBox.evaluate(el => {
            if (!el.querySelector('div[lang]')) return '';
            return Array.from(el.querySelector('div[lang]').children,
                node => {
                    if (node.getAttributeNames().length > 2) return node.getAttribute('title')
                    return node.innerText;
                }
            ).join('').trim();
        });

        if (username == USERNAME) {
            await connection.execute(
                `INSERT INTO pendengki (username, twitter_status, replies, retweets, likes, time_added) VALUES (?, ?, ?, ?, ?, ?)`,
                [`${username}`, `${status}`, `${replyCount}`, `${retweetCount}`, `${likeCount}`, `${postDate}`]
            )
        }

        let threadBox = await page.$('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1ny4l3l.r-1udh08x.r-1j3t67a.r-1vvnge1.r-o7ynqc.r-6416eg');
        if (threadBox) await threadBox.evaluate(el => el.parentElement.parentElement.remove());
        await tweetBox.evaluate(el => el.parentElement.remove());
        await tweetBox.evaluate(el => window.scrollBy(0, el.parentElement.getBoundingClientRect().height));

        await page.evaluate(() => document.querySelector('div[style^="position: absolute; width: 100%; transform: translateY("]').remove());
        await page.waitFor(300);

        i++;
    }
})();