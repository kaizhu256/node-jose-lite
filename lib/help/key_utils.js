const base64url = require('./base64url')
const asn1Dict = require('./key_object.js').asn1Dict;
const BN = asn1Dict.bignum
const keyObjectToJWK = {
    rsa: {
        private (keyObject) {
            const der = keyObject.export({ type: 'pkcs8', format: 'der' })
            const PrivateKeyInfo = asn1Dict.PrivateKeyInfo
            const RSAPrivateKey = asn1Dict.RSAPrivateKey
            const { privateKey } = PrivateKeyInfo.decode(der)
            const { version, n, e, d, p, q, dp, dq, qi } = RSAPrivateKey.decode(privateKey)
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
