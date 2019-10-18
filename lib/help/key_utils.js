const { EOL } = require('os')

const { name: secp256k1 } = require('../jwk/key/secp256k1_crv')
const errors = require('../errors')

const { createPublicKey } = require('./key_object')
const base64url = require('./base64url')
const asn1Dict = require('./key_object.js').asn1Dict;
const computePrimes = require('./rsa_primes')
const { OKP_CURVES, EC_CURVES } = require('./consts')

const BN = asn1Dict.bignum
const oidHexToCurve = new Map([
    ['06082a8648ce3d030107', 'P-256'],
    ['06052b8104000a', secp256k1],
    ['06052b81040022', 'P-384'],
    ['06052b81040023', 'P-521']
])
const EC_KEY_OID = '1.2.840.10045.2.1'.split('.')
const crvToOid = new Map([
    ['P-256', '1.2.840.10045.3.1.7'.split('.')],
    [secp256k1, '1.3.132.0.10'.split('.')],
    ['P-384', '1.3.132.0.34'.split('.')],
    ['P-521', '1.3.132.0.35'.split('.')]
])
const crvToOidBuf = new Map([
    ['P-256', Buffer.from('06082a8648ce3d030107', 'hex')],
    [secp256k1, Buffer.from('06052b8104000a', 'hex')],
    ['P-384', Buffer.from('06052b81040022', 'hex')],
    ['P-521', Buffer.from('06052b81040023', 'hex')]
])

const keyObjectToJWK = {
    rsa: {
        private (keyObject) {
            const der = keyObject.export({ type: 'pkcs8', format: 'der' })

            const PrivateKeyInfo = asn1Dict.PrivateKeyInfo
            const RSAPrivateKey = asn1Dict.RSAPrivateKey

            const { privateKey } = PrivateKeyInfo.decode(der)
            const { version, n, e, d, p, q, dp, dq, qi } = RSAPrivateKey.decode(privateKey)

            if (version !== 'two-prime') {
                throw new errors.JOSENotSupported('Private RSA keys with more than two primes are not supported')
            }

            return {
                kty: 'RSA',
                n: base64url.encodeBN(n),
                e: base64url.encodeBN(e),
                d: base64url.encodeBN(d),
                p: base64url.encodeBN(p),
                q: base64url.encodeBN(q),
                dp: base64url.encodeBN(dp),
                dq: base64url.encodeBN(dq),
                qi: base64url.encodeBN(qi)
            }
        },
        public (keyObject) {
            const der = keyObject.export({ type: 'spki', format: 'der' })

            const PublicKeyInfo = asn1Dict.PublicKeyInfo
            const RSAPublicKey = asn1Dict.RSAPublicKey

            const { publicKey: { data: publicKey } } = PublicKeyInfo.decode(der)
            const { n, e } = RSAPublicKey.decode(publicKey)

            return {
                kty: 'RSA',
                n: base64url.encodeBN(n),
                e: base64url.encodeBN(e)
            }
        }
    },
}

module.exports.keyObjectToJWK = (keyObject) => {
    if (keyObject.type === 'private') {
        return keyObjectToJWK[keyObject.asymmetricKeyType].private(keyObject)
    }

    return keyObjectToJWK[keyObject.asymmetricKeyType].public(keyObject)
}

const concatEcPublicKey = (x, y) => ({
    unused: 0,
    data: Buffer.concat([
        Buffer.alloc(1, 4),
        base64url.decodeToBuffer(x),
        base64url.decodeToBuffer(y)
    ])
})

const okpCrvToOid = (crv) => {
    switch (crv) {
        case 'X25519':
            return '1.3.101.110'.split('.')
        case 'X448':
            return '1.3.101.111'.split('.')
        case 'Ed25519':
            return '1.3.101.112'.split('.')
        case 'Ed448':
            return '1.3.101.113'.split('.')
    }
}

const jwkToPem = {
    RSA: {
        private (jwk, { calculateMissingRSAPrimes }) {
            const RSAPrivateKey = asn1Dict.RSAPrivateKey

            if ('oth' in jwk) {
                throw new errors.JOSENotSupported('Private RSA keys with more than two primes are not supported')
            }

            if (jwk.p || jwk.q || jwk.dp || jwk.dq || jwk.qi) {
                if (!(jwk.p && jwk.q && jwk.dp && jwk.dq && jwk.qi)) {
                    throw new errors.JWKInvalid('all other private key parameters must be present when any one of them is present')
                }
            } else if (calculateMissingRSAPrimes) {
                jwk = computePrimes(jwk)
            } else if (!calculateMissingRSAPrimes) {
                throw new errors.JOSENotSupported('importing private RSA keys without all other private key parameters is not enabled, see documentation and its advisory on how and when its ok to enable it')
            }

            return RSAPrivateKey.encode({
                version: 0,
                n: new BN(base64url.decodeToBuffer(jwk.n)),
                e: new BN(base64url.decodeToBuffer(jwk.e)),
                d: new BN(base64url.decodeToBuffer(jwk.d)),
                p: new BN(base64url.decodeToBuffer(jwk.p)),
                q: new BN(base64url.decodeToBuffer(jwk.q)),
                dp: new BN(base64url.decodeToBuffer(jwk.dp)),
                dq: new BN(base64url.decodeToBuffer(jwk.dq)),
                qi: new BN(base64url.decodeToBuffer(jwk.qi))
            }, 'pem', { label: 'RSA PRIVATE KEY' })
        },
        public (jwk) {
            const RSAPublicKey = asn1Dict.RSAPublicKey

            return RSAPublicKey.encode({
                version: 0,
                n: new BN(base64url.decodeToBuffer(jwk.n)),
                e: new BN(base64url.decodeToBuffer(jwk.e))
            }, 'pem', { label: 'RSA PUBLIC KEY' })
        }
    }
}
