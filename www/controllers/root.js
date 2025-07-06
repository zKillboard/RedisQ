'use strict';

module.exports = {
    paths: '/',
    get: get
}

async function get(req, res, app) {
   return { redirect: "https://github.com/zKillboard/RedisQ" };
}