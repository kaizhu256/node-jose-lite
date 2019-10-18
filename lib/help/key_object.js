let { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('crypto')
const asn1 = require('./asn1')
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
        const RSAPublicKey = asn1.get('RSAPublicKey')
        const key = RSAPublicKey.encode(input.asn1)
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
            keyObject.asn1 = parsed
            keyObject.asymmetricKeyType = 'rsa'
            keyObject.type = 'public'
            keyObject.pem = RSAPublicKey.encode(parsed, 'pem', { label: 'RSA PUBLIC KEY' })
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
        keyObject.asn1 = parsed
        keyObject.asymmetricKeyType = 'rsa'
        keyObject.type = 'private'
        keyObject.pem = RSAPrivateKey.encode(parsed, 'pem', { label: 'RSA PRIVATE KEY' })
        return keyObject;
    //!! case 'pkcs8':
    default:
        keyObject = createPrivateKey({ type: "pkcs1", key: asn1.get('PrivateKeyInfo').decode(key, format, { label }).privateKey, format: 'der' })
        keyObject.pkcs8 = key
        return keyObject
    }
}
module.exports = { createPublicKey, createPrivateKey, createSecretKey, KeyObject }
