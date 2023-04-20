const crypto = require('crypto')


const calculateHash = (recordValues) => {
    return crypto.createHash('sha256').update(recordValues.join('&')).digest('hex');
}

module.exports = calculateHash;
