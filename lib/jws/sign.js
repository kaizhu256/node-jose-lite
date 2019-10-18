const base64url = require('../help/base64url')
const isDisjoint = require('../help/is_disjoint')
const isObject = require('../help/is_object')
const deepClone = require('../help/deep_clone')
const Key = require('../jwk/key/base')
const { JWSInvalid } = require('../errors')
const { check, sign } = require('../jwa')
const serializers = require('./serializers')
const PROCESS_RECIPIENT = Symbol('PROCESS_RECIPIENT')
const map = new WeakMap()
const i = (ctx) => {
    if (!map.has(ctx)) {
        map.set(ctx, {})
    }
    return map.get(ctx)
}
class Sign {
    constructor (payload) {
        payload = base64url.JSON.encode(payload)
        i(this).payload = payload
        i(this).recipients = []
    }
    /*
      * @public
      */
    recipient (key, protectedHeader) {
        i(this).recipients.push({
            key,
            protectedHeader: protectedHeader ? deepClone(protectedHeader) : undefined,
        })
        return this
    }
    /*
      * @private
      */
    [PROCESS_RECIPIENT] (recipient) {
        const { key, protectedHeader } = recipient
        const joseHeader = {
            protected: protectedHeader || {},
        }
        let alg = joseHeader.protected.alg
        if (alg) {
            check(key, 'sign', alg)
        } else {
            alg = [...key.algorithms('sign')][0]
            if (recipient.protectedHeader) {
                joseHeader.protected.alg = recipient.protectedHeader.alg = alg
            } else {
                joseHeader.protected = recipient.protectedHeader = { alg }
            }
        }
        if (!alg) {
            throw new JWSInvalid('could not resolve a usable "alg" for a recipient')
        }
        if (joseHeader.protected.crit && joseHeader.protected.crit.includes('b64')) {
            if (i(this).b64 !== undefined && i(this).b64 !== joseHeader.protected.b64) {
                throw new JWSInvalid('the "b64" Header Parameter value MUST be the same for all recipients')
            } else {
                i(this).b64 = joseHeader.protected.b64
            }
            if (!joseHeader.protected.b64) {
                i(this).payload = base64url.decode(i(this).payload)
            }
        }
        recipient.protected = Object.keys(joseHeader.protected).length ? base64url.JSON.encode(joseHeader.protected) : ''
        recipient.signature = base64url.encodeBuffer(sign(alg, key, Buffer.from(`${recipient.protected}.${i(this).payload}`)))
    }
    /*
      * @public
      */
    sign (serialization) {
        const serializer = serializers.compact
        serializer.validate(this, i(this).recipients)
        i(this).recipients.forEach(this[PROCESS_RECIPIENT].bind(this))
        return serializer(i(this).payload, i(this).recipients)
    }
}
module.exports = function (payload, key, opt = {}) {
    const {
        algorithm, audience, expiresIn, header = {}, iat = true,
        issuer, jti, kid = true, nonce, notBefore, subject, now = new Date()
    } = opt
    const unix = globalThis.jwtEpoch(now)
    payload = {
        ...payload,
        sub: subject || payload.sub,
        aud: audience || payload.aud,
        iss: issuer || payload.iss,
        jti: jti || payload.jti,
        iat: iat ? unix : payload.iat,
        nonce: nonce || payload.nonce,
        exp: expiresIn ? unix + globalThis.jwtSecs(expiresIn) : payload.exp,
        nbf: notBefore ? unix + globalThis.jwtSecs(notBefore) : payload.nbf
    }
    const jws = new Sign(payload)
    jws.recipient(key, {
        ...header,
        alg: algorithm || header.alg,
        kid: kid ? key.kid : header.kid
    })
    return jws.sign("compact")
}
