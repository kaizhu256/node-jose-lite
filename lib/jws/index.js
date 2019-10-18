const Sign = require('./sign')
const verify = require('./verify')

module.exports.sign = function (payload, key, protectedHeader, unprotectedHeader) {
    const jws = new Sign(payload)
    jws.recipient(key, protectedHeader, unprotectedHeader)
    return jws.sign("compact")
}
module.exports.verify = verify
