const base64url = require('../help/base64url')
const combineHeader = (prot = {}, unprotected = {}, header = {}) => {
    if (typeof prot === 'string') {
        prot = base64url.JSON.decode(prot)
    }
    const p2s = prot.p2s || unprotected.p2s || header.p2s
    const apu = prot.apu || unprotected.apu || header.apu
    const apv = prot.apv || unprotected.apv || header.apv
    const iv = prot.iv || unprotected.iv || header.iv
    const tag = prot.tag || unprotected.tag || header.tag
    return {
        ...prot,
        ...unprotected,
        ...header,
        ...(typeof p2s === 'string' ? { p2s: base64url.decodeToBuffer(p2s) } : undefined),
        ...(typeof apu === 'string' ? { apu: base64url.decodeToBuffer(apu) } : undefined),
        ...(typeof apv === 'string' ? { apv: base64url.decodeToBuffer(apv) } : undefined),
        ...(typeof iv === 'string' ? { iv: base64url.decodeToBuffer(iv) } : undefined),
        ...(typeof tag === 'string' ? { tag: base64url.decodeToBuffer(tag) } : undefined)
    }
}
/*
 * @public
 */
const jweDecrypt = (skipValidateHeaders, serialization, jwe, key, { crit = [], algorithms } = {}) => {
    let alg, ciphertext, enc, encryptedKey, iv, opts, prot, tag, unprotected, cek, aad, header
    serialization = "compact";
    if (serialization === 'compact') { // compact serialization format
        ([prot, encryptedKey, iv, ciphertext, tag] = jwe.split('.'))
    } else { // flattened serialization format
        ({ protected: prot, encrypted_key: encryptedKey, iv, ciphertext, tag, unprotected, aad, header } = jwe)
    }
    opts = combineHeader(prot, unprotected, header);
    ({ alg, enc } = opts)
    try {
        const unwrapped = require('../jwa').keyManagementDecrypt(alg, key, base64url.decodeToBuffer(encryptedKey), opts)
        cek = require('../jwk').asKey(require('../help/key_object').createSecretKey(unwrapped), { alg: enc, use: 'enc' })
    } catch (err) {
        // To mitigate the attacks described in RFC 3218, the
        // recipient MUST NOT distinguish between format, padding, and length
        // errors of encrypted keys.  It is strongly recommended, in the event
        // of receiving an improperly formatted key, that the recipient
        // substitute a randomly generated CEK and proceed to the next step, to
        // mitigate timing attacks.
        cek = require('./generate_cek')(enc)
    }
    let adata
    adata = Buffer.from(prot || '')
    try {
        iv = base64url.decodeToBuffer(iv)
    } catch (err) {}
    try {
        tag = base64url.decodeToBuffer(tag)
    } catch (err) {}
    let cleartext = require('../jwa').decrypt(enc, cek, base64url.decodeToBuffer(ciphertext), { iv, tag, aad: adata })
    return cleartext
}
module.exports.decrypt = jweDecrypt.bind(undefined, false, undefined)
