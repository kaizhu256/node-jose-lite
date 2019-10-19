const OctKey = require('./oct')
module.exports.asKey = function (key, parameters, { calculateMissingRSAPrimes = false } = {}) {
    return new OctKey(key, parameters)
};
