const JWA = {
    sign: new Map(),
    verify: new Map(),
    keyManagementEncrypt: new Map(),
    keyManagementDecrypt: new Map(),
    encrypt: new Map(),
    decrypt: new Map()
}
// sign, verify
require('./hmac')(JWA)
require('./rsassa_pss')(JWA)
// encrypt, decrypt
require('./aes_cbc_hmac_sha2')(JWA)
// wrapKey, unwrapKey
require('./rsaes')(JWA)
module.exports = {
    sign: (alg, key, payload) => {
        return JWA.sign.get(alg)(key, payload)
    },
    verify: (alg, key, payload, signature) => {
        return JWA.verify.get(alg)(key, payload, signature)
    },
    keyManagementEncrypt: (alg, key, payload, opts) => {
        return JWA.keyManagementEncrypt.get(alg)(key, payload, opts)
    },
    keyManagementDecrypt: (alg, key, payload, opts) => {
        return JWA.keyManagementDecrypt.get(alg)(key, payload, opts)
    },
    encrypt: (alg, key, cleartext, opts) => {
        return JWA.encrypt.get(alg)(key, cleartext, opts)
    },
    decrypt: (alg, key, ciphertext, opts) => {
        return JWA.decrypt.get(alg)(key, ciphertext, opts)
    }
}
