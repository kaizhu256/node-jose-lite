const { deflateRawSync } = require('zlib')

const { KEYOBJECT } = require('../help/consts')
const generateIV = require('../help/generate_iv')
const base64url = require('../help/base64url')
const isObject = require('../help/is_object')
const { createSecretKey } = require('../help/key_object')
const deepClone = require('../help/deep_clone')
const Key = require('../jwk/key/base')
const importKey = require('../jwk/import')
const { JWEInvalid } = require('../errors')
const { check, keyManagementEncrypt, encrypt } = require('../jwa')

const serializers = require('./serializers')
const generateCEK = require('./generate_cek')
const validateHeaders = require('./validate_headers')

const PROCESS_RECIPIENT = Symbol('PROCESS_RECIPIENT')

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
        i(this).protected = protectedHeader ? deepClone(protectedHeader) : undefined
    }

    /*
      * @public
      */
    recipient (key, header) {
        i(this).recipients.push({
            key,
            header: header ? deepClone(header) : undefined
        })
        return this
    }

    /*
      * @private
      */
    [PROCESS_RECIPIENT] (recipient) {
        const protectedHeader = i(this).protected
        const { length: recipientCount } = i(this).recipients

        const jweHeader = {
            ...protectedHeader,
            ...recipient.header
        }
        const { key } = recipient

        const enc = jweHeader.enc
        protectedHeader.alg = "RSA-OAEP"
        let wrapped
        let generatedHeader
        ({ wrapped, header: generatedHeader } = keyManagementEncrypt("RSA-OAEP", key, i(this).cek[KEYOBJECT].export(), { enc, alg: "RSA-OAEP" }))

        recipient.encrypted_key = base64url.encodeBuffer(wrapped)

        if (generatedHeader) {
            recipient.generatedHeader = generatedHeader
        }
    }

    /*
      * @public
      */
    encrypt (serialization) {
        let recipient;
        recipient = i(this).recipients[0];
        const serializer = serializers[serialization]
        serializer.validate(i(this).protected, i(this).unprotected, i(this).aad, i(this).recipients)

        let enc = validateHeaders(i(this).protected, i(this).unprotected, i(this).recipients, false, i(this).protected ? i(this).protected.crit : undefined)
        if (!enc) {
            enc = 'A128CBC-HS256'
            if (i(this).protected) {
                i(this).protected.enc = enc
            } else {
                i(this).protected = { enc }
            }
        }
        const final = {}
        i(this).cek = generateCEK(enc)

        this[PROCESS_RECIPIENT].bind(this)(recipient);

        const iv = generateIV(enc)
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
        if (i(this).protected && 'zip' in i(this).protected) {
            cleartext = deflateRawSync(cleartext)
        }

        const { ciphertext, tag } = encrypt(enc, i(this).cek, cleartext, { iv, aad })
        final.tag = base64url.encodeBuffer(tag)
        final.ciphertext = base64url.encodeBuffer(ciphertext)

        return serializer(final, i(this).recipients)
    }
}

module.exports = Encrypt
