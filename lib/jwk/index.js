const { generate, generateSync } = require('./generate')

module.exports.asKey = function (key, parameters, { calculateMissingRSAPrimes = false } = {}) {
    return new require('./key/oct')(key, parameters)
};
module.exports.generate = generate
module.exports.generateSync = generateSync
