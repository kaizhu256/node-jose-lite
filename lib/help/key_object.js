let { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('crypto')
const asn1 = require('asn1.js')
const asn1Dict = {};



asn1Dict.AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', function () {
    this.seq().obj(
        this.key('algorithm').objid(),
        this.key('parameters').optional().any()
    )
})
asn1Dict.PrivateKeyInfo = asn1.define('PrivateKeyInfo', function () {
    this.seq().obj(
        this.key('version').int(),
        this.key('algorithm').use(asn1Dict.AlgorithmIdentifier),
        this.key('privateKey').octstr()
    )
})
asn1Dict.PublicKeyInfo = asn1.define('PublicKeyInfo', function () {
    this.seq().obj(
        this.key('algorithm').use(asn1Dict.AlgorithmIdentifier),
        this.key('publicKey').bitstr()
    )
})
asn1Dict.PrivateKey = asn1.define('PrivateKey', function () {
    this.octstr().contains().obj(
        this.key('privateKey').octstr()
    )
})
asn1Dict.OneAsymmetricKey = asn1.define('OneAsymmetricKey', function () {
    this.seq().obj(
        this.key('version').int(),
        this.key('algorithm').use(asn1Dict.AlgorithmIdentifier),
        this.key('privateKey').use(asn1Dict.PrivateKey)
    )
})
asn1Dict.RSAPrivateKey = asn1.define('RSAPrivateKey', function () {
    this.seq().obj(
        this.key('version').int({ 0: 'two-prime', 1: 'multi' }),
        this.key('n').int(),
        this.key('e').int(),
        this.key('d').int(),
        this.key('p').int(),
        this.key('q').int(),
        this.key('dp').int(),
        this.key('dq').int(),
        this.key('qi').int()
    )
})
asn1Dict.RSAPublicKey = asn1.define('RSAPublicKey', function () {
    this.seq().obj(
        this.key('n').int(),
        this.key('e').int()
    )
})



asn1Dict.bignum = asn1.bignum;













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
            key: asn1Dict.RSAPublicKey.encode(input.asn1Dict),
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
            const parsed = asn1Dict.PublicKeyInfo.decode(key, format, {
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
            let RSAPublicKey = asn1Dict.RSAPublicKey;
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
        const RSAPrivateKey = asn1Dict.RSAPrivateKey
        parsed = RSAPrivateKey.decode(key, format, { label })
        keyObject = new KeyObject()
        keyObject.asn1Dict = parsed
        keyObject.asymmetricKeyType = 'rsa'
        keyObject.type = 'private'
        keyObject.pem = RSAPrivateKey.encode(parsed, 'pem', { label: 'RSA PRIVATE KEY' })
        return keyObject;
    //!! case 'pkcs8':
    default:
        keyObject = createPrivateKey({ type: "pkcs1", key: asn1Dict.PrivateKeyInfo.decode(key, format, { label }).privateKey, format: 'der' })
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
