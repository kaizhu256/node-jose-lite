const OctKey = require('./key/oct')
const asKey = (key, parameters, { calculateMissingRSAPrimes = false } = {}) => {
    return new OctKey(key, parameters)
}
module.exports = asKey
