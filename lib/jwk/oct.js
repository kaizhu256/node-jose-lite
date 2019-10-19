const { randomBytes } = require('crypto')

const { createSecretKey } = require('../help/key_object')
const base64url = require('../help/base64url')
const { KEYOBJECT } = require('../help/consts')
const {
  THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS,
  KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = require('../help/consts')

const Key = require('./base')

const ENC_ALGS = new Set(['A128CBC-HS256', 'A128GCM', 'A192CBC-HS384', 'A192GCM', 'A256CBC-HS512', 'A256GCM'])
const ENC_LEN = new Set([128, 192, 256, 384, 512])
const WRAP_LEN = new Set([128, 192, 256])

const OCT_PUBLIC = new Set()
Object.freeze(OCT_PUBLIC)
const OCT_PRIVATE = new Set(['k'])
Object.freeze(OCT_PRIVATE)

// Octet sequence Key Type
class OctKey extends Key {
  constructor (...args) {
    super(...args)
    Object.defineProperties(this, {
      kty: {
        value: 'oct',
        enumerable: true
      },
      length: {
        value: this[KEYOBJECT] ? this[KEYOBJECT].symmetricKeySize * 8 : undefined
      },
      k: {
        enumerable: false,
        configurable: true
      }
    })
  }
}
module.exports = OctKey
