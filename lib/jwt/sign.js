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
    return require('../jws/sign').sign(payload, key, {
        ...header,
        alg: algorithm || header.alg,
        kid: kid ? key.kid : header.kid
    })
}
