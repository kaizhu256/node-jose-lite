let { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('crypto')
const asn1 = require('asn1.js')
const asn1Dict = new Map()
const AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', require('./algorithm_identifier'))
asn1Dict.set('AlgorithmIdentifier', AlgorithmIdentifier)
const PrivateKeyInfo = asn1.define('PrivateKeyInfo', require('./private_key_info')(AlgorithmIdentifier))
asn1Dict.set('PrivateKeyInfo', PrivateKeyInfo)
const PublicKeyInfo = asn1.define('PublicKeyInfo', require('./public_key_info')(AlgorithmIdentifier))
asn1Dict.set('PublicKeyInfo', PublicKeyInfo)
const PrivateKey = asn1.define('PrivateKey', require('./private_key'))
asn1Dict.set('PrivateKey', PrivateKey)
const OneAsymmetricKey = asn1.define('OneAsymmetricKey', require('./one_asymmetric_key')(AlgorithmIdentifier, PrivateKey))
asn1Dict.set('OneAsymmetricKey', OneAsymmetricKey)
const RSAPrivateKey = asn1.define('RSAPrivateKey', require('./rsa_private_key'))
asn1Dict.set('RSAPrivateKey', RSAPrivateKey)
const RSAPublicKey = asn1.define('RSAPublicKey', require('./rsa_public_key'))
asn1Dict.set('RSAPublicKey', RSAPublicKey)
asn1Dict.bignum = asn1.bignum













const pemToDer = function (pem) {
    return Buffer.from(pem.replace((
        /(?:-----(?:BEGIN|END)(?: (?:RSA|EC))? (?:PRIVATE|PUBLIC) KEY-----|\s)/g
    ), ''), 'base64');
};
KeyObject = class KeyObject {
    export ({ cipher, passphrase, type, format } = {}) {
        if (this.type === 'secret') {
            return Buffer.from(this.buffer)
        }
        return pemToDer(this.pkcs8)
    }
    asInput (needsPublic = false) {
        switch (this.type) {
            case 'public':
                return this.pem
            default:
                if (needsPublic) {
                    if (!('pub' in this)) {
                        this.pub = createPublicKey(this)
                    }
                    return this.pub.asInput()
                }
                return this.pem
        }
    }
}
createSecretKey = (buffer) => {
    const keyObject = new KeyObject()
    keyObject.buffer = Buffer.from(buffer)
    keyObject.symmetricKeySize = buffer.length
    keyObject.type = 'secret'
    return keyObject
}
createPublicKey = (input) => {
    if (input instanceof KeyObject) {
        return createPublicKey({
            key: asn1Dict.get('RSAPublicKey').encode(input.asn1Dict),
            format: 'der',
            type: 'pkcs1'
        })
    }
    if (typeof input === 'string' || Buffer.isBuffer(input)) {
        input = { key: input, format: 'pem' }
    }
    const { format } = input
    let { key, type } = input
    let label
    if (format === 'pem') {
        key = key.toString()
        type = 'spki'
        label = 'PUBLIC KEY'
    }
    switch (type) {
        case 'spki': {
            const parsed = asn1Dict.get('PublicKeyInfo').decode(key, format, {
                label
            })
            let keyObject
            switch (parsed.algorithm.algorithm.join('.')) {
                //!! case '1.2.840.113549.1.1.1': {
                default: {
                    keyObject = createPublicKey({
                        type: "pkcs1",
                        key: parsed.publicKey.data,
                        format: 'der'
                    })
                    break
                }
            }
            return keyObject
        }
        //!! case 'pkcs1': {
        default: {
            let RSAPublicKey = asn1Dict.get('RSAPublicKey');
            const parsed = RSAPublicKey.decode(key, format, { label })
            const keyObject = new KeyObject()
            keyObject.asn1Dict = parsed
            keyObject.asymmetricKeyType = 'rsa'
            keyObject.type = 'public'
            keyObject.pem = RSAPublicKey.encode(parsed, 'pem', {
                label: 'RSA PUBLIC KEY'
            })
            return keyObject
        }
    }
}
createPrivateKey = (input, hints) => {
    if (typeof input === 'string' || Buffer.isBuffer(input)) {
        input = { key: input, format: 'pem' }
    }
    const { format, passphrase } = input
    let { key, type } = input
    let label
    if (format === 'pem') {
        key = key.toString()
        type = 'pkcs8'
        label = 'PRIVATE KEY'
    }
    let parsed;
    let keyObject;
    switch (type) {
    case 'pkcs1':
        const RSAPrivateKey = asn1Dict.get('RSAPrivateKey')
        parsed = RSAPrivateKey.decode(key, format, { label })
        keyObject = new KeyObject()
        keyObject.asn1Dict = parsed
        keyObject.asymmetricKeyType = 'rsa'
        keyObject.type = 'private'
        keyObject.pem = RSAPrivateKey.encode(parsed, 'pem', { label: 'RSA PRIVATE KEY' })
        return keyObject;
    //!! case 'pkcs8':
    default:
        keyObject = createPrivateKey({ type: "pkcs1", key: asn1Dict.get('PrivateKeyInfo').decode(key, format, { label }).privateKey, format: 'der' })
        keyObject.pkcs8 = key
        return keyObject
    }
}
module.exports = {
    asn1Dict,
    createPublicKey,
    createPrivateKey,
    createSecretKey,
    KeyObject
}
