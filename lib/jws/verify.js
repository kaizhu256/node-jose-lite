const base64url = require('../help/base64url')
const isDisjoint = require('../help/is_disjoint')
let validateCrit = require('../help/validate_crit')
const Key = require('../jwk/base')
const errors = require('../errors')
const { verify } = require('../jwa')

validateCrit = validateCrit.bind(undefined, errors.JWSInvalid)
const SINGLE_RECIPIENT = new Set(['compact', 'flattened'])

/*
 * @public
 */
const jwsVerify = (skipDisjointCheck, serialization, jws, key, { crit = [], complete = false, algorithms } = {}) => {
    if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some(s => typeof s !== 'string' || !s))) {
        throw new TypeError('"algorithms" option must be an array of non-empty strings')
    } else if (algorithms) {
        algorithms = new Set(algorithms)
    }

    if (!Array.isArray(crit) || crit.some(s => typeof s !== 'string' || !s)) {
        throw new TypeError('"crit" option must be an array of non-empty strings')
    }

    serialization = "compact";
    let prot // protected header
    let header // unprotected header
    let payload
    let signature
    let alg

    // treat general format with one recipient as flattened
    // skips iteration and avoids multi errors in this case
    if (serialization === 'general' && jws.signatures.length === 1) {
        serialization = 'flattened'
        const { signatures, ...root } = jws
        jws = { ...root, ...signatures[0] }
    }

    if (SINGLE_RECIPIENT.has(serialization)) {
        if (serialization === 'compact') { // compact serialization format
            ([prot, payload, signature] = jws.split('.'))
        } else { // flattened serialization format
            ({ protected: prot, payload, signature, header } = jws)
        }

        if (!header) {
            skipDisjointCheck = true
        }

        let parsedProt = {}
        if (prot) {
            try {
                parsedProt = base64url.JSON.decode(prot)
            } catch (err) {
                if (err instanceof errors.JOSEError) {
                    throw err
                }

                throw new errors.JWSInvalid('could not parse JWS protected header')
            }
        } else {
            skipDisjointCheck = skipDisjointCheck || true
        }

        if (!skipDisjointCheck && !isDisjoint(parsedProt, header)) {
            throw new errors.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint')
        }

        const combinedHeader = { ...parsedProt, ...header }
        validateCrit(parsedProt, header, crit)

        alg = parsedProt.alg || (header && header.alg)
        if (!alg) {
            throw new errors.JWSInvalid('missing JWS signature algorithm')
        } else if (algorithms && !algorithms.has(alg)) {
            throw new errors.JOSEAlgNotWhitelisted('alg not whitelisted')
        }

        if (!verify(alg, key, Buffer.from([prot, payload].join('.')), base64url.decodeToBuffer(signature))) {
            throw new errors.JWSVerificationFailed()
        }

        payload = base64url.JSON.decode(payload)

        if (complete) {
            const result = { payload, key }
            if (prot) result.protected = parsedProt
            if (header) result.header = header
            return result
        }

        return payload
    }

    // general serialization format
    const { signatures, ...root } = jws
    const errs = []
    for (const recipient of signatures) {
        try {
            return jwsVerify(false, 'flattened', { ...root, ...recipient }, key, { crit, complete, algorithms: algorithms ? [...algorithms] : undefined })
        } catch (err) {
            errs.push(err)
            continue
        }
    }

    const multi = new errors.JOSEMultiError(errs)
    if ([...multi].some(e => e instanceof errors.JWSVerificationFailed)) {
        throw new errors.JWSVerificationFailed()
    } else if ([...multi].every(e => e instanceof errors.JWKSNoMatchingKey)) {
        throw new errors.JWKSNoMatchingKey()
    }
    throw multi
}

module.exports = jwsVerify.bind(undefined, false, undefined)
