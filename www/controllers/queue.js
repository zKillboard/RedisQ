'use strict';

const fs = require('fs').promises;
const path = require('path');

module.exports = {
	paths: '/queue.php',
	post: post,
}

const MAX_AGE_S = process.env.max_age_s || 9600;
const MAX_AGE_MS = MAX_AGE_S * 1000;

async function post(req, res, app) {
	try {
		const pass = req.body.pass;
		const sack = decodeURI(req.body.package); // can't use the word package, so we'll use sack!

        if (process.env.pass !== pass) return { status_code: 401 };
        if (sack === null) return { status_code: 400 };

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const objectID = 'redisQ:object:' + id;

        await fs.writeFile('./www/public/packages/' + id + '.json', sack, 'utf8');

        const multi = await app.redis.multi();
        await multi.setex(objectID, MAX_AGE_S, sack);
        for (let queueID of await app.redis.keys('redisQ:queue:*')) {
            const listkey = 'redisQ:list:' + queueID.replace('redisQ:queue:', '');
            //await multi.lpush(listkey, objectID);
            await multi.lpush(listkey, id);
            await multi.expire(listkey, MAX_AGE_S);
        }
        await multi.exec();

        return { json: { success: true } }
    } catch (e) {
        console.log(e);
        await app.sleep(1000);
        return { staus_code: 503 };
    }
}

const dirPath =  path.join(process.env.BASEPATH, 'www/public/packages/');


async function cleanup() {
    try {
        console.log('executing file cleanup');
        const files = await fs.readdir(dirPath);

        const now = Date.now();
        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const fullPath = path.join(dirPath, file);
            const stats = await fs.stat(fullPath);

            const age = now - stats.mtimeMs;
            if (age > MAX_AGE_MS) {
                await fs.unlink(fullPath);
                console.log(`Deleted: ${file}`);
            }
        }
    } finally {
        setTimeout(cleanup, 500000 + (Math.floor(Math.random() * 120001) - 60000)); // every 5 minutes
    }
}
setTimeout(cleanup, 1);