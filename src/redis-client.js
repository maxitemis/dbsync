const redis = require("redis");


const client = redis.createClient({
    socket: {
        host: 'redis',
        port: '6379'
    },
    password: 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81'
});

async function connectRedis() {
    await client.connect();
}

async function disconnectRedis() {
    await client.disconnect();
}

async function createKey(keyName, keyValue) {
    await client.set(keyName, keyValue);
}

async function isKeySet(keyName) {
    const fooValue = await client.get(keyName);
    return fooValue !== null;
}

async function deleteKey(keyName) {
    await client.del(keyName);
}

module.exports = {
    connectRedis, disconnectRedis, createKey, isKeySet, deleteKey
}





