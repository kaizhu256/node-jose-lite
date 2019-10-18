const base64url = require('../help/base64url')
const { keyManagementEncrypt, encrypt } = require('../jwa')
let generateCek;
generateCek = function () {
    return require('../jwk/import')(
        require('../help/key_object').createSecretKey(require('crypto').randomBytes(32)),
        { use: 'enc', alg: "A128CBC-HS256" }
    );
};










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
        cek = generateCek()
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













const map = new WeakMap()
const i = (ctx) => {
    if (!map.has(ctx)) {
        map.set(ctx, {})
    }
    return map.get(ctx)
}
class Encrypt {
    constructor (cleartext, protectedHeader) {
        cleartext = Buffer.from(cleartext)
        i(this).recipients = []
        i(this).cleartext = cleartext
        i(this).protected = protectedHeader ? globalThis.deepClone(protectedHeader) : undefined
    }
    /*
      * @public
      */
    recipient (key, header) {
        i(this).recipients.push({
            key,
            header: header ? globalThis.deepClone(header) : undefined
        })
        return this
    }
    /*
      * @public
      */
    encrypt (serialization) {
        let recipient;
        recipient = i(this).recipients[0];
        let enc = 'A128CBC-HS256';
        if (i(this).protected) {
            i(this).protected.enc = enc
        } else {
            i(this).protected = { enc }
        }
        const final = {}
        i(this).cek = generateCek()

        const protectedHeader = i(this).protected
        const { length: recipientCount } = i(this).recipients
        const jweHeader = {
            ...protectedHeader,
            ...recipient.header
        }
        const { key } = recipient
        protectedHeader.alg = "RSA-OAEP"
        recipient.encrypted_key = base64url.encodeBuffer(keyManagementEncrypt(
            "RSA-OAEP",
            key,
            i(this).cek.keyObject.export(),
            { enc, alg: "RSA-OAEP" }
        ).wrapped)


        const iv = require('../help/generate_iv')(enc)
        final.iv = base64url.encodeBuffer(iv)
        if (i(this).recipients.length === 1 && i(this).recipients[0].generatedHeader) {
            const [{ generatedHeader }] = i(this).recipients
            delete i(this).recipients[0].generatedHeader
            i(this).protected = Object.assign({}, i(this).protected, generatedHeader)
        }
        if (i(this).protected) {
            final.protected = base64url.JSON.encode(i(this).protected)
        }
        let aad;
        aad = Buffer.from(final.protected || '')
        let cleartext = i(this).cleartext
        const { ciphertext, tag } = encrypt(enc, i(this).cek, cleartext, { iv, aad })
        final.tag = base64url.encodeBuffer(tag)
        final.ciphertext = base64url.encodeBuffer(ciphertext)
        return `${final.protected}.${recipient.encrypted_key}.${final.iv}.${final.ciphertext}.${final.tag}`;
    }
}
module.exports.encrypt = (cleartext, key, protectedHeader, unprotectedHeader, aad) => {
    const jwe = new Encrypt(cleartext, protectedHeader, unprotectedHeader, aad)
    jwe.recipient(key)
    return jwe.encrypt("compact")
}
