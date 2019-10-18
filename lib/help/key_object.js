let { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('crypto')
if (!createPublicKey || !createPrivateKey || !createSecretKey || !KeyObject) {
    const { EOL } = require('os')
    const errors = require('../errors')
    const isObject = require('./is_object')
    const asn1 = require('./asn1')
    const namedCurve = Symbol('namedCurve')
    const map = new WeakMap()
    const i = (ctx) => {
        if (!map.has(ctx)) {
            map.set(ctx, {})
        }
        return map.get(ctx)
    }
    const pemToDer = pem => Buffer.from(pem.replace(/(?:-----(?:BEGIN|END)(?: (?:RSA|EC))? (?:PRIVATE|PUBLIC) KEY-----|\s)/g, ''), 'base64')
    const derToPem = (der, label) => `-----BEGIN ${label}-----${EOL}${der.toString('base64').match(/.{1,64}/g).join(EOL)}${EOL}-----END ${label}-----`
    KeyObject = class KeyObject {
        export ({ cipher, passphrase, type, format } = {}) {
            if (i(this).type === 'secret') {
                return Buffer.from(i(this).buffer)
            }
            if (format !== 'pem' && format !== 'der') {
                throw new TypeError('format must be one of "pem" or "der"')
            }
            if (passphrase !== undefined || cipher !== undefined) {
                throw new errors.JOSENotSupported('encrypted private keys are not supported in your Node.js runtime version')
            }
            if (type === 'pkcs8') {
                if (i(this).pkcs8) {
                    if (format === 'der' && typeof i(this).pkcs8 === 'string') {
                        return pemToDer(i(this).pkcs8)
                    }
                    if (format === 'pem' && Buffer.isBuffer(i(this).pkcs8)) {
                        return derToPem(i(this).pkcs8, 'PRIVATE KEY')
                    }
                    return i(this).pkcs8
                }
                if (this.asymmetricKeyType === 'rsa') {
                    const parsed = i(this).asn1
                    const RSAPrivateKey = asn1.get('RSAPrivateKey')
                    const privateKey = RSAPrivateKey.encode(parsed)
                    const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
                    const pkcs8 = PrivateKeyInfo.encode({
                        version: 0,
                        privateKey,
                        algorithm: {
                            algorithm: '1.2.840.113549.1.1.1'.split('.'),
                            parameters: Buffer.from('BQA=', 'base64')
                        }
                    })
                    i(this).pkcs8 = pkcs8
                    return this.export({ type, format })
                }
                if (this.asymmetricKeyType === 'ec') {
                    const parsed = i(this).asn1
                    const ECPrivateKey = asn1.get('ECPrivateKey')
                    const privateKey = ECPrivateKey.encode({
                        version: parsed.version,
                        privateKey: parsed.privateKey,
                        publicKey: parsed.publicKey
                    })
                    const PrivateKeyInfo = asn1.get('PrivateKeyInfo')
                    const OID = asn1.get('OID')
                    const pkcs8 = PrivateKeyInfo.encode({
                        version: 0,
                        privateKey,
                        algorithm: {
                            algorithm: '1.2.840.10045.2.1'.split('.'),
                            parameters: OID.encode(i(this).asn1.parameters.value)
                        }
                    })
                    i(this).pkcs8 = pkcs8
                    return this.export({ type, format })
                }
            }
            if (this.asymmetricKeyType === 'rsa' && type === 'pkcs1') {
                if (format === 'pem') {
                    return i(this).pem
                }
                return pemToDer(i(this).pem)
            } else if (this.asymmetricKeyType === 'ec' && type === 'sec1') {
                if (format === 'pem') {
                    return i(this).pem
                }
                return pemToDer(i(this).pem)
            } else {
                throw new TypeError(`type must be one of "spki" or "${this.asymmetricKeyType === 'rsa' ? 'pkcs1' : 'sec1'}"`)
            }
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
                case 'secret':
                    return i(this).buffer
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
            if (input.type !== 'private') {
                throw new TypeError('expected a private key')
            }
            switch (input.asymmetricKeyType) {
                case 'ec': {
                    const PublicKeyInfo = asn1.get('PublicKeyInfo')
                    const OID = asn1.get('OID')
                    const key = PublicKeyInfo.encode({
                        algorithm: {
                            algorithm: '1.2.840.10045.2.1'.split('.'),
                            parameters: OID.encode(i(input).asn1.parameters.value)
                        },
                        publicKey: i(input).asn1.publicKey
                    })
                    return createPublicKey({ key, format: 'der', type: 'spki' })
                }
                case 'rsa': {
                    const RSAPublicKey = asn1.get('RSAPublicKey')
                    const key = RSAPublicKey.encode(i(input).asn1)
                    return createPublicKey({ key, format: 'der', type: 'pkcs1' })
                }
            }
        }
        if (typeof input === 'string' || Buffer.isBuffer(input)) {
            input = { key: input, format: 'pem' }
        }
        if (!isObject(input)) {
            throw new TypeError('input must be a string, Buffer or an object')
        }
        const { format } = input
        let { key, type } = input
        if (typeof key !== 'string' && !Buffer.isBuffer(key)) {
            throw new TypeError('key must be a string or Buffer')
        }
        if (format !== 'pem' && format !== 'der') {
            throw new TypeError('format must be one of "pem" or "der"')
        }
        let label
        if (format === 'pem') {
            key = key.toString()
            switch (key.split(/\r?\n/g)[0].toString()) {
                case '-----BEGIN PUBLIC KEY-----':
                    type = 'spki'
                    label = 'PUBLIC KEY'
                    break
                case '-----BEGIN RSA PUBLIC KEY-----':
                    type = 'pkcs1'
                    label = 'RSA PUBLIC KEY'
                    break
                case '-----BEGIN CERTIFICATE-----':
                    throw new errors.JOSENotSupported('X.509 certificates are supported in your Node.js runtime version')
                default:
                    throw new TypeError('unknown/unsupported PEM type')
            }
        }
        switch (type) {
            case 'spki': {
                const PublicKeyInfo = asn1.get('PublicKeyInfo')
                const parsed = PublicKeyInfo.decode(key, format, { label })
                let type, keyObject
                switch (parsed.algorithm.algorithm.join('.')) {
                    case '1.2.840.10045.2.1': {
                        keyObject = new KeyObject()
                        i(keyObject).asn1 = parsed
                        i(keyObject).asymmetricKeyType = 'ec'
                        i(keyObject).type = 'public'
                        i(keyObject).pem = PublicKeyInfo.encode(parsed, 'pem', { label: 'PUBLIC KEY' })
                        break
                    }
                    case '1.2.840.113549.1.1.1': {
                        type = 'pkcs1'
                        keyObject = createPublicKey({ type, key: parsed.publicKey.data, format: 'der' })
                        break
                    }
                    default:
                        throw new errors.JOSENotSupported(`OID ${parsed.algorithm.algorithm.join('.')} is not supported in your Node.js runtime version`)
                }
                return keyObject
            }
            case 'pkcs1': {
                const RSAPublicKey = asn1.get('RSAPublicKey')
                const parsed = RSAPublicKey.decode(key, format, { label })
                const keyObject = new KeyObject()
                i(keyObject).asn1 = parsed
                i(keyObject).asymmetricKeyType = 'rsa'
                i(keyObject).type = 'public'
                i(keyObject).pem = RSAPublicKey.encode(parsed, 'pem', { label: 'RSA PUBLIC KEY' })
                return keyObject
            }
            default:
                throw new TypeError('type must be one of "pkcs1" or "spki"')
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
}
module.exports = { createPublicKey, createPrivateKey, createSecretKey, KeyObject }
