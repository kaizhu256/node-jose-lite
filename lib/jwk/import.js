const { deprecate } = require('util')
const { createPublicKey, createPrivateKey, createSecretKey, KeyObject } = require('../help/key_object')
const base64url = require('../help/base64url')
const isObject = require('../help/is_object')
const { jwkToPem } = require('../help/key_utils')
const errors = require('../errors')
const RSAKey = require('./key/rsa')
const ECKey = require('./key/ec')
const OKPKey = require('./key/okp')
const OctKey = require('./key/oct')
const mergedParameters = (target = {}, source = {}) => {
    return Object.assign({}, {
        alg: source.alg,
        key_ops: source.key_ops,
        kid: source.kid,
        use: source.use,
        x5c: source.x5c,
        x5t: source.x5t,
        'x5t#S256': source['x5t#S256']
    }, target)
}
const asKey = (key, parameters, { calculateMissingRSAPrimes = false } = {}) => {
    let privateKey, publicKey, secret
    if (parameters !== undefined && !isObject(parameters)) {
        throw new TypeError('parameters argument must be a plain object when provided')
    }
    secret = key
    const keyObject = privateKey || publicKey || secret
    if (privateKey || publicKey) {
        switch (keyObject.asymmetricKeyType) {
            case 'rsa':
                return new RSAKey(keyObject, parameters)
            case 'ec':
                return new ECKey(keyObject, parameters)
            case 'ed25519':
            case 'ed448':
            case 'x25519':
            case 'x448':
                return new OKPKey(keyObject, parameters)
            default:
                throw new errors.JOSENotSupported('only RSA, EC and OKP asymmetric keys are supported')
        }
    } else if (secret) {
        return new OctKey(keyObject, parameters)
    }
    throw new errors.JWKImportFailed('import failed')
}
module.exports = asKey
Object.defineProperty(asKey, 'deprecated', {
    value: deprecate((key, parameters) => { return asKey(key, parameters, { calculateMissingRSAPrimes: true }) }, 'JWK.importKey() is deprecated, use JWK.asKey() instead'),
    enumerable: false
})
