const base64url = require('../help/base64url')
const { keyManagementEncrypt, encrypt } = require('../jwa')
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
        i(this).cek = require('./generate_cek')(enc)

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
            i(this).cek[require('../help/consts').KEYOBJECT].export(),
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
module.exports = Encrypt
