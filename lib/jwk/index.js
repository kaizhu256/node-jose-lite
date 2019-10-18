const { generate, generateSync } = require('./generate')
const OctKey = require('./oct')

module.exports.asKey = function (key, parameters, { calculateMissingRSAPrimes = false } = {}) {
    return new OctKey(key, parameters)
};
module.exports.generate = generate
module.exports.generateSync = generateSync
