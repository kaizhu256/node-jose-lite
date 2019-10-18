let { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('crypto')
const asn1 = require('./asn1')
const map = new WeakMap()
const i = (ctx) => {
    if (!map.has(ctx)) {
        map.set(ctx, {})
    }
    return map.get(ctx)
}
const pemToDer = function (pem) {
    return Buffer.from(pem.replace((
        /(?:-----(?:BEGIN|END)(?: (?:RSA|EC))? (?:PRIVATE|PUBLIC) KEY-----|\s)/g
    ), ''), 'base64');
};
KeyObject = class KeyObject {
    export ({ cipher, passphrase, type, format } = {}) {
        if (i(this).type === 'secret') {
            return Buffer.from(i(this).buffer)
        }
        return pemToDer(i(this).pkcs8)
    }
    get type () {
        return i(this).type
    }
    get asymmetricKeyType () {
        return i(this).asymmetricKeyType
    }
    get symmetricKeySize () {
        return i(this).symmetricKeySize
    }
    asInput (needsPublic = false) {
        switch (i(this).type) {
            case 'public':
                return i(this).pem
            default:
                if (needsPublic) {
                    if (!('pub' in i(this))) {
                        i(this).pub = createPublicKey(this)
                    }
                    return i(this).pub.asInput()
                }
                return i(this).pem
        }
    }
}
createSecretKey = (buffer) => {
    const keyObject = new KeyObject()
    i(keyObject).buffer = Buffer.from(buffer)
    i(keyObject).symmetricKeySize = buffer.length
    i(keyObject).type = 'secret'
    return keyObject
}
createPublicKey = (input) => {
    if (input instanceof KeyObject) {
        const RSAPublicKey = asn1.get('RSAPublicKey')
        const key = RSAPublicKey.encode(i(input).asn1)
        return createPublicKey({ key, format: 'der', type: 'pkcs1' })
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
            const PublicKeyInfo = asn1.get('PublicKeyInfo')
            const parsed = PublicKeyInfo.decode(key, format, { label })
            let type, keyObject
            switch (parsed.algorithm.algorithm.join('.')) {
                //!! case '1.2.840.113549.1.1.1': {
                default: {
                    type = 'pkcs1'
                    keyObject = createPublicKey({ type, key: parsed.publicKey.data, format: 'der' })
                    break
                }
            }
            return keyObject
        }
        //!! case 'pkcs1': {
        default: {
            const RSAPublicKey = asn1.get('RSAPublicKey')
            const parsed = RSAPublicKey.decode(key, format, { label })
            const keyObject = new KeyObject()
            i(keyObject).asn1 = parsed
            i(keyObject).asymmetricKeyType = 'rsa'
            i(keyObject).type = 'public'
            i(keyObject).pem = RSAPublicKey.encode(parsed, 'pem', { label: 'RSA PUBLIC KEY' })
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
        const RSAPrivateKey = asn1.get('RSAPrivateKey')
        parsed = RSAPrivateKey.decode(key, format, { label })
        keyObject = new KeyObject()
        i(keyObject).asn1 = parsed
        i(keyObject).asymmetricKeyType = 'rsa'
        i(keyObject).type = 'private'
        i(keyObject).pem = RSAPrivateKey.encode(parsed, 'pem', { label: 'RSA PRIVATE KEY' })
        return keyObject;
    //!! case 'pkcs8':
    default:
        const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
        parsed = PrivateKeyInfo.decode(key, format, { label })
        let type;
        type = 'pkcs1'
        keyObject = createPrivateKey({ type, key: parsed.privateKey, format: 'der' })
        i(keyObject).pkcs8 = key
        return keyObject
    }
}
module.exports = { createPublicKey, createPrivateKey, createSecretKey, KeyObject }
