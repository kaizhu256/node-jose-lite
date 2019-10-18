const Encrypt = require('./encrypt')
const decrypt = require('./decrypt')
const single = (serialization, cleartext, key, protectedHeader, unprotectedHeader, aad) => {
    const jwe = new Encrypt(cleartext, protectedHeader, unprotectedHeader, aad)
    jwe.recipient(key)
    return jwe.encrypt(serialization)
}
module.exports.Encrypt = Encrypt
module.exports.encrypt = single.bind(undefined, 'compact')
module.exports.decrypt = decrypt
