const base64url = require('../help/base64url')
const isDisjoint = require('../help/is_disjoint')
const isObject = require('../help/is_object')
const deepClone = require('../help/deep_clone')
const Key = require('../jwk/key/base')
const { JWSInvalid } = require('../errors')
const { check, sign } = require('../jwa')
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
        recipient.protected = Object.keys(joseHeader.protected).length ? base64url.JSON.encode(joseHeader.protected) : ''
        recipient.signature = base64url.encodeBuffer(sign("PS256", key, Buffer.from(`${recipient.protected}.${i(this).payload}`)))
    }
    /*
      * @public
      */
    sign (serialization) {
        let payload;
        let recipient;
        payload = i(this).payload;
        recipient = i(this).recipients[0];
        this[PROCESS_RECIPIENT].bind(this)(recipient);
        return `${recipient.protected}.${payload}.${recipient.signature}`
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
