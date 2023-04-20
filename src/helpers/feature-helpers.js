const makeDelay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const WAITING_TIME = 100;

async function waitValueForChange(callback, oldValue, maxtimeout) {
    const startTime = Date.now();
    let newTime;
    let newValue;
    do {
        newValue = await callback();
        newTime = Date.now();
        if (newValue !== oldValue) {
            return newValue;
        }
        await makeDelay(WAITING_TIME);
    } while (newTime - startTime < maxtimeout)

    return newValue;
}

async function waitUntilSuccess(callback, maxtimeout) {
    const startTime = Date.now();
    let newTime;
    let newValue = null;
    do {
        try {
            newValue = await callback();
        } catch (errIgnored) {

        }
        newTime = Date.now();
        if (newValue !== null) {
            return newValue;
        }
        await makeDelay(WAITING_TIME);
    } while (newTime - startTime < maxtimeout)

    return newValue;
}

async function waitUntilFails(callback, maxtimeout) {
    const startTime = Date.now();
    let newTime;
    let newValue = null;
    do {
        try {
            newValue = await callback();
        } catch (errIgnored) {
            return null;
        }
        newTime = Date.now();
        await makeDelay(WAITING_TIME);
    } while (newTime - startTime < maxtimeout)

    return newValue;
}

module.exports = { makeDelay, waitUntilFails, waitUntilSuccess, waitValueForChange }
